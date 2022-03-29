import { Command } from 'commander'
import * as pkg from './package.json'

const program = new Command

/**
 * 基础信息配置
 */
program.version(pkg.version, '-v, --version', '输出当前版本：v' + pkg.version).name('lv')

program
  .command('init [project-name] [tools-name...]')
  .description(
    '初始化一个项目；[project-name]：项目名 必填输入；[tools-name]：要按照的工具名，选填，可多选，全量`husky prettier eslint babel cz`'
  )
  .action((projectName, toolsName) => require('./index')(projectName, toolsName))

program
  .command('add [tools-name...]')
  .description('配置一个项目，根据当前是否存在项目进行工具安装')
  .action(toolsName => require('./index')('', toolsName))

program.parse()