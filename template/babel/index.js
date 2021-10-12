const path = require('path')
const copy = require('./../../src/copy')
const { spinnerAll, getLatestVersion } = require('./../../src/global')

module.exports = async targetPath => {
  spinnerAll.start('babel')
  copy(path.join(__dirname, 'babel.config.js'), path.join(targetPath, 'babel.config.js'))
  spinnerAll.succeed('babel')

  const latestVersions = await Promise.all([
    getLatestVersion('@babel/runtime-corejs3'),
    getLatestVersion('@babel/core'),
    getLatestVersion('@babel/plugin-transform-runtime'),
    getLatestVersion('@babel/preset-env'),
  ])

  return {
    pkg: {
      dependencies: {
        '@babel/runtime-corejs3': `^${latestVersions[0]}`,
      },
      devDependencies: {
        '@babel/core': `^${latestVersions[1]}`,
        '@babel/plugin-transform-runtime': `^${latestVersions[2]}`,
        '@babel/preset-env': `^${promises[3]}`,
      },
    },
  }
}
