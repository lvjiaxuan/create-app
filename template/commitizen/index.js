const path = require('path')
const copy = require('./../../src/copy')
const { spinnerAll, getLatestVersion } = require('./../../src/global')

module.exports = async targetPath => {
  spinnerAll.start('commitizen')
  copy(path.join(__dirname, '.cz-simple.js'), path.join(targetPath, '.cz-simple.js'))
  spinnerAll.succeed('commitizen')

  return {
    pkg: {
      scripts: {
        cz: 'git-cz',
      },
      config: {
        commitizen: {
          path: './.cz-simple',
        },
      },
      devDependencies: {
        commitizen: `^${await getLatestVersion('commitizen')}`,
      },
    },
  }
}
