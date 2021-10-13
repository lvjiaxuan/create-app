#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const cwd = process.cwd()
const installTools = require('./src/installTools')
const { spinner } = require('./src/utils/global')

const main = async (projectName = '', toolsName = []) => {
  // let projectName = '' // 项目名
  let targetPath = '' // 项目绝对路径
  let initProjectType = '' // 如何处理项目

  if(projectName) {// 来自 `lv init`
    // 1. 检查是否已存在目录
    // 2. 不存在则新建项目
  } else {
    // 来自 `npm init`
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      projectName = path.basename(cwd)
      targetPath = cwd
      spinner.info(`更新当前项目 · ${projectName}\n`)
      initProjectType = 'update'
    } else {
      const argv = process.argv.slice(2)
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
  }


  // 2. 选择要安装的工具
  const { toolsName } = await prompts({
    type: 'multiselect',
    name: 'toolsName',
    message: '选择要安装的工具',
    instructions: false,
    hint: '- Space to select. Return to submit',
    choices: [
      { title: 'husky: husky + lint-staged', value: 'husky', selected: true },
      { title: 'prettier: prettier', value: 'prettier' },
      { title: 'eslint: eslint', value: 'eslint' },
      {
        title: 'babel: @babel/preset-env + @babel/plugin-transform-runtime + @babel/runtime-corejs3',
        value: 'babel',
      },
      { title: 'commitizen: commitizen with customizable config', value: 'commitizen' },
    ],
  })
  // toolsName = toolsName.filter(item => ['husky', 'prettier', 'eslint', 'babel', 'commitizen'].includes(item))

  // 3. 开始注入项目文件
  installTools(targetPath, toolsName)
}

module.exports = main
