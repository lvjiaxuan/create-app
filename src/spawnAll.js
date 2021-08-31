const spawn = require('cross-spawn')
const { spinnerAll } = require('./global')

const spawnPromises = []
let depInstall = false
let huskyInstall = false
let targetPath = ''
module.exports = ({
  depInstall: depInstallParam,
  huskyInstall: huskyInstallParam,
  targetPath: targetPathParam,
}) => {
  depInstall = depInstallParam
  huskyInstall = huskyInstallParam
  targetPath = targetPathParam

  // all concurrency
  installDep()
  gitStatus()
  globalCZStatus()

  return spawnPromises
}

function installDep() {
  depInstall
    ? spawnPromises.push(
        new Promise(resolve => {
          spinnerAll.start('npm install')
          spawn('npm i', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
            if (code == 0) {
              spinnerAll.succeed('npm install')
              resolve()
            }
          })
        })
      )
    : spinnerAll.info('No `npm install` required')
}

function gitStatus() {
  const gitChild = spawn('git status', { stdio: 'pipe', cwd: targetPath })
  spawnPromises.push(
    new Promise(resolve => {
      gitChild.on('close', code => {
        if (code == 0) {
          spinnerAll.info('git repo exists')
          resolve()
        }
      })
      gitChild.stderr.on('data', () => {
        spinnerAll.start('git init')
        spawn('git init', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
          if (code == 0) {
            spinnerAll.succeed('git init')
            resolve()
          }
        })
      })
    }).then(() => installHusky())
  )
}

function installHusky() {
  huskyInstall
    ? new Promise(resolve => {
        spinnerAll.start('husky install')
        spawn('npx husky install', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
          if (code == 0) {
            spinnerAll.succeed('husky install')
            resolve()
          }
        })
      })
    : spinnerAll.info('No `husky install` required')
}

function globalCZStatus() {
  spinnerAll.start('global commitizen check')
  spawnPromises.push(
    new Promise(resolve =>
      spawn('npm ls commitizen --depth 0 -g', { stdio: 'pipe' }).stdout.on('data', data => {
        const hasCZ = /\scommitizen@\d\.\d\.\d/.test(data.toString())
        spinnerAll.succeed('global commitizen check', false)
        spinnerAll.info(`global commitizen ${hasCZ ? 'exists' : 'not found'}`)
        if (hasCZ) {
          resolve()
        } else {
          spinnerAll.start('global commitizen install')
          spawn('npm i commitizen -g', { stdio: 'pipe' }).on('close', code => {
            if (code == 0) {
              spinnerAll.succeed('global commitizen install')
              resolve()
            }
          })
        }
      })
    )
  )
}
