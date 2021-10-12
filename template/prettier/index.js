const path = require('path')
const copy = require('./../../src/copy')
const { spinnerAll, getLatestVersion } = require('./../../src/global')

module.exports = async targetPath => {
  spinnerAll.start('prettier')
  copy(path.join(__dirname, '.prettierrc.js'), path.join(targetPath, '.prettierrc.js'))
  copy(path.join(__dirname, '.prettierignore'), path.join(targetPath, '.prettierignore'))
  spinnerAll.succeed('prettier')

  return {
    pkg: {
      'lint-staged': {
        '*': 'prettier -w -u',
      },
      devDependencies: {
        prettier: `^${ await getLatestVersion('prettier') }`,
      },
    }
  }
}
