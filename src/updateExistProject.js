const fs = require('fs')
const path = require('path')
const copy = require('./copy')
const getPkgJson = require('./getPkgJson')
const { cosmiconfigSync } = require('cosmiconfig')
const {
  deepMerge,
  spinner,
  tplPath,
  getPrettierCjsStr,
  mergeIgnore,
  prettierConfig,
} = require('./global')

module.exports = async targetPath => {
  updateRc(targetPath)
  const huskyInstall = updateHusky(targetPath)
  updateCZ(targetPath)
  updateGitIgnore(targetPath)
  const depInstall = await updateDep(targetPath)
  return { depInstall, huskyInstall }
}

function updateRc(targetPath) {
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
        const mergeConfig = deepMerge(require(path.join(tplPath, `_${name}rc.js`)), rcModule.config)
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
}

function updateHusky(targetPath) {
  let huskyInstall = false
  if (!fs.existsSync(path.join(targetPath, '.husky'))) {
    spinner.start('husky config')
    huskyInstall = true
    copy(path.join(tplPath, '_husky'), path.join(targetPath, '.husky'))
    spinner.succeed('husky config')
  }
  return huskyInstall
}

async function updateDep(targetPath) {
  let depInstall = false
  let newPkg = {}
  if (fs.existsSync(path.join(targetPath, 'package.json'))) {
    const pkg = require(path.join(targetPath, 'package.json'))
    newPkg = await getPkgJson(pkg)
    for (const name in newPkg.dependencies) {
      if (pkg.dependencies[name] != newPkg.dependencies[name]) {
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
    fs.writeFileSync(
      // 涉及网络异步io
      path.join(targetPath, 'package.json'),
      JSON.stringify(newPkg, null, 2)
    )
  }

  return depInstall
}

function updateCZ(targetPath) {
  spinner.start('commitizen config')
  !fs.existsSync(path.join(targetPath, '.cz-simple.js')) &&
    copy(path.join(tplPath, '_cz-simple.js'), path.join(targetPath, '.cz-simple.js'))
  spinner.succeed('commitizen config')
}

function updateGitIgnore(targetPath) {
  spinner.start('gitignore file')
  !fs.existsSync(path.join(targetPath, '.gitignore'))
    ? copy(path.join(tplPath, '_gitignore'), path.join(targetPath, '.gitignore'))
    : mergeIgnore(path.join(tplPath, '_gitignore'), path.join(targetPath, '.gitignore'))
  spinner.succeed('gitignore file')
}
