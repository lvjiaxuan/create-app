const path = require('path')
const copy = require('./../../src/copy')
const { spinnerAll, getLatestVersion } = require('./../../src/global')

module.exports = async targetPath => {
  spinnerAll.start('eslint')
  copy(path.join(__dirname, '.eslintrc.js'), path.join(targetPath, '.eslintrc.js'))
  copy(path.join(__dirname, '.eslintignore'), path.join(targetPath, '.eslintignore'))
  spinnerAll.succeed('eslint')

  return {
    pkg: {
      'lint-staged': {
        '*.{vue,js}': 'eslint --fix',
      },
      devDependencies: {
        eslint: `^${await getLatestVersion('eslint')}`,
      },
    }
  }
}
