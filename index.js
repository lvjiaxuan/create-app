#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const cwd = process.cwd()
const argv = process.argv.slice(2)
const createNewProject = require('./src/createNewProject')
const updateExistProject = require('./src/updateExistProject')
const { prompt } = require('enquirer')
const { spinner, spinnerAppend, loadGlobalCZ } = require('./src/global')

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
            if (code == 0) {
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
        if (code == 0) {
          spinner.info('git repo exist')
          resolve()
        }
      })
      gitChild.stderr.on('data', () =>
        spawn('git init', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
          if (code == 0) {
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
              if (code == 0) {
                spinnerAppend.succeed('husky install')
                resolve()
              }
            })
          })
        : spinner.info('No `husky install` required')
    )
  )

  spinnerAppend.start('global commitizen check')
  console.log(11)
  spawnPromises.push(
    new Promise(resolve =>
      loadGlobalCZ().then(hasCZ => {
        console.log({ hasCZ })
        spinnerAppend.succeed('global commitizen check')
        if (hasCZ) {
          spinner.info('exist global commitizen')
          resolve()
        } else {
          spinnerAppend.start('global commitizen install')
          spawn('npm i commitizen -g', { stdio: 'pipe' }).on('close', code => {
            if (code == 0) {
              spinnerAppend.succeed('global commitizen install')
              resolve()
            }
          })
        }
      })
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
