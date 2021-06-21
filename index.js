#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const cwd = process.cwd()
const argv = process.argv.slice(2)
const createNewProject = require('./src/createNewProject')
const updateExistProject = require('./src/updateExistProject')
const { prompt } = require('enquirer')
const { spinner, spinnerAll, loadGlobalCZ } = require('./src/global')

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

  /**
   * 以下是一些并发的异步任务
   * 
   * 使用 spinnerAll 保证 start 运行
   */

  const spawnPromises = []
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
      }
      )
    }).then(() =>
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
    )
  )

  spinnerAll.start('global commitizen check')
  spawnPromises.push(
    new Promise(resolve =>
      loadGlobalCZ().then(hasCZ => {
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

  Promise.all(spawnPromises).then(() => {
    console.log()
    spinner.succeed('@lvjx/app 已完成')
  })
}

main().catch(err => {
  console.error('main', err)
  spinner.fail('失败了，请检查')
})
