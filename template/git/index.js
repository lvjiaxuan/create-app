const path = require('path')
const spawn = require('cross-spawn')
const copy = require('./../../src/copy')
const { spinnerAll } = require('./../../src/global')

module.exports = async targetPath => {
  spinnerAll.start('git')
  copy(path.join(__dirname, '_gitignore'), path.join(targetPath, '.gitignore'))
  checkGitStatus(targetPath)
  spinnerAll.succeed('git')
  return {
    cliFun() {
      const gitChild = spawn('git status', { stdio: 'pipe', cwd: targetPath })
      new Promise(resolve => {
        gitChild.on('close', code => {
          if (code == 0) {
            spinnerAll.info('git repo existed')
            resolve()
          }
        })
        gitChild.stderr.on('data', () => {
          spawn('git init', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
            if (code == 0) {
              resolve()
            }
          })
        })
      })
    },
  }
}
