const fs = require('fs')
const path = require('path')
const ncu = require('npm-check-updates')
const ora = require('ora')
const cwd = process.cwd()
const argv = process.argv.slice(2)
const { prompt } = require('enquirer')
const ncuDepsPath = path.join(__dirname, './deps_json/index.json')
const depsInfo = require(ncuDepsPath)

// const spinner = ora('please wait...').start()
// spinner.stop()

const main = async () => {
  const { projectName } = await prompt({
    // todo 验证projectName
    type: 'input',
    name: 'projectName',
    message: `Project name:`,
    initial: 'base-demo',
  })

  const targetPath = path.join(cwd, projectName)
  if(fs.existsSync(targetPath)) {

  } else {
    createNewProject()
  }
}
// main().catch(e => console.error(e))

// ===================
//  helper
// ===================

function copy(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
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

async function createNewProject(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true })
  fs.writeFile(path.join(targetPath, 'package.json'), JSON.stringify(await getPkgJson(), null, 2))
}

function copyTemplates(targetPath) {
  fs.readdirSync(path.join(__))

}

async function getPkgJson(existPkg = {}) {
  const upgraded = await ncu.run({
    // Pass any cli option
    packageFile: ncuDepsPath,
    upgrade: false,
  })

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
      '*.{vue,js}': 'eslint --fix'
    },
    ...existPkg,
    ...depsInfo,
  }
}
