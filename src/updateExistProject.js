const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const copy = require('./copy')
const getPkgJson = require('./getPkgJson')
const { cosmiconfigSync } = require('cosmiconfig')
const { deepMerge, prettierConfig, spinner, tplPath } = require('./global')

module.exports = async targetPath => {
  const explorerSyncs = {
    babel: cosmiconfigSync('babel').search(targetPath),
    prettier: cosmiconfigSync('prettier').search(targetPath),
    eslint: cosmiconfigSync('eslint').search(targetPath),
  }
  for (const name in explorerSyncs) {
    spinner.start(name + ' config')
    const rcModule = explorerSyncs[name]
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
      if (!rcModule || rcModule.isEmpty) {
        rcModule && rcModule.filepath && fs.unlinkSync(rcModule.filepath)
        copy(path.join(tplPath, `_${name}rc.js`), path.join(targetPath, `.${name}rc.js`))
      } else {
        const mergeConfig = deepMerge(rcModule.config, require(path.join(tplPath, `_${name}rc.js`)))
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