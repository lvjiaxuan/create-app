#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const cwd = process.cwd()
const argv = process.argv.slice(process.argv[1].includes('@lvjx\\create-app\\main.js') ? 3 : 2)
const createNewProject = require('./src/createNewProject')
const updateExistProject = require('./src/updateExistProject')
const spawnAll = require('./src/spawnAll')
const { spinner } = require('./src/global')

const main = async () => {
  let targetPath = '' // 项目绝对路径
  let projectName = '' // 项目名
  let initProjectType = '' // 如何处理项目

  // 1. 定位位置
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    projectName = path.basename(cwd)
    targetPath = cwd
    spinner.info(`更新当前项目 · ${projectName}\n`)
    initProjectType = 'update'
  } else {
    projectName = argv[0]
      ? argv[0]
      : (
          await prompts({
            type: 'text',
            name: 'projectName',
            message: '项目名称',
            initial: 'base-demo',
          })
        ).projectName

    targetPath = path.join(cwd, projectName)
    if (fs.existsSync(targetPath)) {
      spinner.info(`更新目录下项目 · ${projectName} \n`)
      initProjectType = 'update'
    } else {
      spinner.info(`新建项目 · ${projectName} \n`)
      initProjectType = 'create'
    }
  }

  // 2. 选择要安装的工具
  const { tools } = await prompts({
    type: 'multiselect',
    name: 'tools',
    message: '选择要安装的工具',
    instructions: false,
    hint: '- Space to select. Return to submit',
    choices: [
      { title: 'husky: husky + lint-staged', value: 'husky', selected: true },
      { title: 'prettier: prettier', value: 'prettier' },
      { title: 'eslint: eslint', value: 'eslint' },
      { title: 'babel: @babel/preset-env + @babel/plugin-transform-runtime + @babel/runtime-corejs3', value: 'babel' },
      { title: 'commitizen: commitizen with customizable config', value: 'commitizen' },
    ],
  })

  // 3. 开始注入项目文件
  if(initProjectType) {
    createNewProject(targetPath, tools)
  } else {

  }
}

main().catch(e => console.log(e.toString()))