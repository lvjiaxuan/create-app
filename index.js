#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const ncu = require('npm-check-updates')
const spinner = require('ora')()
const cwd = process.cwd()
const argv = process.argv.slice(2)
const { cosmiconfigSync } = require('cosmiconfig')
const { prompt } = require('enquirer')
const prettier = require('prettier')
const spawn = require('cross-spawn')
const prettierConfig = {
  ...require(path.join(__dirname, 'template/_prettierrc.js')),
  parser: 'babel',
}
const ncuDepsPath = path.join(__dirname, './deps_json/index.json')
const tplPath = path.join(__dirname, 'template')
const depsInfo = require(ncuDepsPath)
const renameFiles = {
  _gitignore: '.gitignore',
  _eslintignore: '.eslintignore',
  '_eslintrc.js': '.eslintrc.js',
  _prettierignore: '.prettierignore',
  '_prettierrc.js': '.prettierrc.js',
  _husky: '.husky',
}

const spinnerAppend = (() => {

  const appends = []
  const start = append => {
    append && appends.push(append)
    appends.length && spinner.start(`（${appends.length}）` + appends.toString())
  }
  const succeed = append => {
    const idx = appends.findIndex(item => item === append)
    if(idx > -1) {
      appends.splice(idx, 1)
      spinner.succeed(append)
      start()
    }
  }
  return {
    // installs,
    start,
    succeed,
  }
})()

const main = async () => {
  let targetPath = ''
  let projectName = ''
  let depInstall = false
  let huskyInstall = false
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    projectName = path.basename(cwd)
    targetPath = cwd
    spinner.info(`更新当前项目（${projectName}）\n`)
    const res = await updateExistProject(targetPath)
    depInstall = res.depInstall
    huskyInstall = res.huskyInstall
  } else {
    projectName = argv[0]
      ? argv[0]
      : (
          await prompt({
            // todo 验证projectName
            type: 'input',
            name: 'projectName',
            message: '项目名称',
            initial: 'base-demo',
          })
        ).projectName

    targetPath = path.join(cwd, projectName)
    if (fs.existsSync(targetPath)) {
      spinner.info(`更新目录下项目（${projectName}）\n`)
      const res = await updateExistProject(targetPath)
      depInstall = res.depInstall
      huskyInstall = res.huskyInstall
    } else {
      depInstall = true
      huskyInstall = true
      spinner.info(`新建项目（${projectName}）\n`)
      await createNewProject(targetPath)
    }
  }

  const spawnPromises = []
  depInstall
    ? spawnPromises.push(
        new Promise(resolve => {
          spinnerAppend.start('npm install')
          spawn('npm i', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
            if(code == 0 ) {
              spinnerAppend.succeed('npm install')
              resolve()
            }
          })
        })
      )
    : spinner.info('No `npm install` required')

  const gitChild = spawn('git status', { stdio: 'pipe', cwd: targetPath })
  spawnPromises.push(
    new Promise(resolve => {
      gitChild.on('close', code => {
        if(code == 0 ) {
          spinner.info('git repo exist')
          resolve()
        }
      })
      gitChild.stderr.on('data', () =>
        spawn('git init', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
          if(code == 0 ) {
            spinner.succeed('git init')
            resolve()
          }
        })
      )
    }).then(() =>
      huskyInstall
        ? new Promise(resolve => {
            spinnerAppend.start('husky install')
            spawn('npx husky install', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
              if(code == 0 ) {
                spinnerAppend.succeed('husky install')
                resolve()
              }
            })
          })
        : spinner.info('No `husky install` required')
    )
  )

  Promise.all(spawnPromises).then(() => {
    console.log()
    spinner.succeed('@lvjx/app 已完成')
  })
}
main().catch(err => {
  console.error('main', err)
  spinner.fail('失败了，请检查')
})

// ===================
//  helper
// ===================

/**
 * @method 更新已有项目
 * @param {string} targetPath 目标项目位置
 * @returns
 */
async function updateExistProject(targetPath) {
  const explorerSyncs = {
    babel: cosmiconfigSync('babel').search(targetPath),
    prettier: cosmiconfigSync('prettier').search(targetPath),
    eslint: cosmiconfigSync('eslint').search(targetPath),
  }
  for (const name in explorerSyncs) {
    spinner.start(name + ' config')
    const module = explorerSyncs[name]
    if (name === 'babel') {
      const babelTargetPath = path.join(targetPath, `babel.config.js`)
      const babelTplPath = path.join(tplPath, `babel.config.js`)
      if (fs.existsSync(babelTargetPath)) {
        const mergeConfig = deepMerge(require(babelTargetPath), require(babelTplPath))
        fs.writeFileSync(
          path.join(targetPath, `babel.config.js`),
          getPrettierCjsStr(mergeConfig, prettierConfig)
        )
      } else {
        copy(babelTplPath, babelTargetPath)
      }
    } else {
      if (!module || module.isEmpty) {
        module && module.filepath && fs.unlinkSync(module.filepath)
        copy(path.join(tplPath, `_${name}rc.js`), path.join(targetPath, `.${name}rc.js`))
      } else {
        const mergeConfig = deepMerge(module.config, require(path.join(tplPath, `_${name}rc.js`)))
        fs.writeFileSync(
          path.join(targetPath, `.${name}rc.js`),
          getPrettierCjsStr(mergeConfig, prettierConfig)
        )
      }

      const ignoreTargetPath = path.join(targetPath, `.${name}ignore`)
      const ignoreTplPath = path.join(tplPath, `_${name}ignore`)
      fs.existsSync(ignoreTargetPath)
        ? mergeIgnore(ignoreTplPath, ignoreTargetPath)
        : copy(ignoreTplPath, ignoreTargetPath)
    }
    spinner.succeed(name + ' config')
  }

  let huskyInstall = false
  if (!fs.existsSync(path.join(targetPath, '.husky'))) {
    spinner.start('husky config')
    huskyInstall = true
    copy(path.join(tplPath, '_husky'), path.join(targetPath, '.husky'))
    spinner.succeed('husky config')
  }

  let pkg = {}
  let depInstall = false
  const newPkg = await getPkgJson(pkg)
  if (fs.existsSync(path.join(targetPath, 'package.json'))) {
    pkg = require(path.join(targetPath, 'package.json'))
    pkg.dependencies = pkg.dependencies ?? {}
    pkg.devDependencies = pkg.devDependencies ?? {}
    for (const name in newPkg.dependencies) {
      if (pkg.dependencies[name] != newPkg.dependencies[name]) {
        console.log(pkg.dependencies.name, newPkg.dependencies[name])
        depInstall = true
        break
      }
    }

    if (!depInstall) {
      for (const name in newPkg.devDependencies) {
        if (pkg.dependencies.name != newPkg.dependencies[name]) {
          depInstall = true
          break
        }
      }
    }
  }

  fs.writeFileSync(
    // 涉及网络异步io
    path.join(targetPath, 'package.json'),
    JSON.stringify(newPkg, null, 2)
  )

  return { depInstall, huskyInstall }
}

/**
 * @method 创建新项目
 * @param {string} targetPath 目标项目位置
 */
async function createNewProject(targetPath) {
  spinner.start('模板文件复制')
  fs.mkdirSync(targetPath, { recursive: true })
  copyTemplates(targetPath) // 极快的本地io
  spinner.succeed('模板文件复制')
  fs.writeFileSync(
    // 涉及网络异步io
    path.join(targetPath, 'package.json'),
    JSON.stringify(await getPkgJson(), null, 2)
  )
}

function getPrettierCjsStr(mergeConfig, prettierConfig) {
  const main = config =>
    Object.keys(config).reduce((acc, key) => {
      const checkValue = config[key]
      if (
        Object.prototype.toString.call(checkValue) === '[object Object]' ||
        Array.isArray(checkValue)
      ) {
        acc[key] = main(checkValue)
      } else {
        if (
          [Infinity, -Infinity, NaN].includes(checkValue) ||
          Object.prototype.toString.call(checkValue) === '[object RegExp]'
        ) {
          acc[key] = `#${checkValue.toString()}#`
        } else if (checkValue === undefined) {
          acc[key] = '#undefined#'
        } else {
          acc[key] = checkValue
        }
      }
      return acc
    }, config)

  return prettier.format(
    `module.exports=${JSON.stringify(main(mergeConfig)).replace(/"#|#"/g, '')}`,
    prettierConfig
  )
}

async function getPkgJson(pkg = {}) {
  spinnerAppend.start('npm check updates')
  const upgraded = await ncu.run({
    // Pass any cli option
    packageFile: ncuDepsPath,
    upgrade: false,
  })
  spinnerAppend.succeed('npm check updates')
  Object.keys(upgraded).forEach(dep => {
    if (Object.prototype.hasOwnProperty.call(depsInfo.dependencies, dep)) {
      depsInfo.dependencies[dep] = upgraded[dep]
    } else if (Object.prototype.hasOwnProperty.call(depsInfo.devDependencies, dep)) {
      depsInfo.devDependencies[dep] = upgraded[dep]
    }
  })
  return {
    version: '0.0.1',
    description: 'initial demo',
    private: false,
    keywords: [],
    main: 'index.js',
    browserslist: 'last 2 versions, > 1%, not dead',
    author: '',
    email: '',
    homepage: 'https://github.com',
    repository: {
      type: 'git or svn',
      url: '',
    },
    publishConfig: {
      tag: 'latest',
      registry: 'https://registry.npmjs.org/',
      access: 'public',
    },
    license: 'MIT',
    'lint-staged': {
      '*': 'prettier -w -u',
      '*.{vue,js}': 'eslint --fix',
    },
    ...pkg,
    dependencies: deepMerge(pkg.dependencies, depsInfo.dependencies),
    devDependencies: deepMerge(pkg.devDependencies, depsInfo.devDependencies),
  }
}

function copy(src, dest) {
  const stat = fs.statSync(src)
  const srcBasename = path.basename(src)
  const renameDest = path.format({
    dir: path.dirname(dest),
    base: renameFiles[srcBasename] ? renameFiles[srcBasename] : srcBasename,
  })
  if (stat.isDirectory()) {
    copyDir(src, renameDest)
  } else {
    fs.copyFileSync(src, renameDest)
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function copyTemplates(targetPath) {
  const files = fs.readdirSync(tplPath)
  for (const file of files) {
    copy(path.join(tplPath, file), path.join(targetPath, file))
  }
}

function mergeIgnore(ignoreTplPath, ignoreTargetPath) {
  const tplArr = fs
    .readFileSync(ignoreTplPath, { encoding: 'utf8' })
    .split(/\n|\r/)
    .filter(i => i)
  const targetArr = fs
    .readFileSync(ignoreTargetPath, { encoding: 'utf8' })
    .split(/\n|\r/)
    .filter(i => i)
  const removalDuplicates = [...new Set([...tplArr, ...targetArr])].reduce((acc, item) => {
    acc += item + '\n'
    return acc
  }, '')
  fs.writeFileSync(
    // 涉及网络异步io
    ignoreTargetPath,
    removalDuplicates
  )
}

function deepMerge(target, ...args) {
  return args.reduce((acc, mergeObj) => {
    if (Object.prototype.toString.call(acc) !== '[object Object]' && !Array.isArray(acc)) {
      // 基本类型及undefined等直接赋值
      acc = mergeObj
      return acc
    }
    return Object.keys(mergeObj).reduce((subAcc, key) => {
      // 遍历对象及数组
      const mergeValue = mergeObj[key] // 将要被合并的对象
      if (Object.prototype.toString.call(mergeValue) === '[object Object]') {
        subAcc[key] = deepMerge(subAcc[key], mergeValue)
      } else if (Array.isArray(mergeValue)) {
        subAcc[key] = subAcc[key] ? subAcc[key] : []
        subAcc[key] = mergeValue.map((item, index) => {
          if (Object.prototype.toString.call(item) === '[object Object]' || Array.isArray(item)) {
            return deepMerge(subAcc[key][index], item)
          }
          return item
        })
      } else {
        subAcc[key] = mergeValue
      }
      return subAcc
    }, acc)
  }, target)
}
