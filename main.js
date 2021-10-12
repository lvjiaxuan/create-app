#!/usr/bin/env node

const program = require('commander')
const pkgVersion = require('./package.json').version

/**
 * 基础信息配置
 */
program.version(pkgVersion, '-v, --version', '输出当前版本').name('lv')

program
  .command('create [project-name]')
  .description('初始化一个项目')
  .action(() => require('./index'))


// program
//   .command('add <tool-name...>')
//   .description('输入husky、prettier、eslint、babel、cz则注入相应工具文件')
//   .action(toolName => {
//     // 打印命令行输入的值
//     console.log('project name is ' + toolName)
//   })

program.parse()