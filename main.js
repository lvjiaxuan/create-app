#!/usr/bin/env node

const program = require('commander')
const pkgVersion = require('./package.json').version

/**
 * 基础信息配置
 */
program.version(pkgVersion, '-v, --version', '输出当前版本').name('lv')

program
  .command('init [project-name] [tools-name...]')
  .description('配置一个项目，输入husky、prettier、eslint、babel、cz则注入相应工具文件')
  .action((projectName, toolsName) => require('./index')(projectName, toolsName))


program.parse()