#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const argv = process.argv.slice(2)
const createNewProject = require('./src/createNewProject')
const updateExistProject = require('./src/updateExistProject')
const spawnAll = require('./src/spawnAll')
const { prompt } = require('enquirer')
const { spinner } = require('./src/global')

const main = async () => {
  let targetPath = ''
  let projectName = ''
  let depInstall = false
  let huskyInstall = false
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    projectName = path.basename(cwd)
    targetPath = cwd
    spinner.info(`更新当前项目 · ${projectName}\n`)
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
      spinner.info(`更新目录下项目 · ${projectName} \n`)
      const res = await updateExistProject(targetPath)
      depInstall = res.depInstall
      huskyInstall = res.huskyInstall
    } else {
      depInstall = true
      huskyInstall = true
      spinner.info(`新建项目 · ${projectName} \n`)
      await createNewProject(targetPath)
    }
  }

  Promise.all(spawnAll({ depInstall, huskyInstall, targetPath })).then(() => {
    console.log()
    spinner.succeed('@lvjx/app 已完成')
  })
}

main().catch(err => {
  console.error('main', err)
  console.log()
  spinner.fail('失败了，请检查')
  // todo rm targetPath
})
