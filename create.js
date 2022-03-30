import fs from 'fs'
import path from 'path'
import prompts from 'prompts'
import installTools from './src/installTools'
import { spinner } from './src/utils/global'

const cwd = process.cwd()

const main = async (projectName = '', toolsName = []) => {
  let targetPath = '' // 项目绝对路径

  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    projectName = path.basename(cwd)
    targetPath = cwd
    spinner.info(`更新当前项目 · ${projectName}\n`)
  } else {
    let argv = process.argv.slice(2)
    if (process.argv[1].includes('@lvjx\\create-app\\main.js')) {
      argv = process.argv[2] == 'init' ? process.argv.slice(3) : ['']
    }

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
    } else {
      spinner.info(`新建项目 · ${projectName} \n`)
    }
  }

  // 2. 选择要安装的工具
  if (toolsName.length == 0) {
    toolsName = (
      await prompts({
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
          { title: 'cz: commitizen with customizable config', value: 'cz' },
        ],
      })
    ).toolsName
  }

  // 3. 开始注入项目文件
  let pkg = {}
  try {
    pkg = require(path.join(targetPath, 'package.json'))
  } catch {}
  installTools(targetPath, toolsName, pkg)
}

main().catch(e => console.error(e))

export default main
