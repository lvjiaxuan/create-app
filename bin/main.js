#!/usr/bin/env node

console.log(process)

const program = require('commander')
const pkgVersion = require('../package.json').version

/**
 * 基础信息配置
 */
program.version(pkgVersion, '-v, --version', '输出当前版本').name('lv')

program
  .command('init [project-name] [tools-name...]')
  .description('初始化一个项目；[project-name]：项目名 必填输入；[tools-name]：要按照的工具名，选填，可多选，全量`husky prettier eslint babel cz`')
  .action((projectName, toolsName) => require('./../dist/out')(projectName, toolsName))

program
  .command('add [tools-name...]')
  .description('配置一个项目，根据当前是否存在项目进行工具安装')
  .action(toolsName => require('./../dits/out')('', toolsName))

program.parse()
