const path = require('path')
const fs = require('fs')
const prettier = require('prettier')
const spinner = require('ora')()

exports.spinner = spinner

exports.renameFiles = {
  _gitignore: '.gitignore',
  _eslintignore: '.eslintignore',
  '_eslintrc.js': '.eslintrc.js',
  _prettierignore: '.prettierignore',
  '_prettierrc.js': '.prettierrc.js',
  _husky: '.husky',
  '_cz-simple.js': '.cz-simple.js',
}

exports.tplPath = path.join(__dirname, '../template')

exports.spinnerAll = (() => ({
  appends: [],
  start(append) {
    append && this.appends.push(append)
    this.appends.length && spinner.start(`（${this.appends.length}）` + this.appends.toString())
  },
  succeed(append, showSucceed = true) {
    const idx = this.appends.findIndex(item => item === append)
    if (idx > -1) {
      this.appends.splice(idx, 1)
      showSucceed && spinner.succeed(append)
      this.start()
    }
  },
  info(text) {
    spinner.info(text)
    this.start()
  }
}))()

const deepMerge = (target, ...args) => {
  return args.reduce((acc, mergeObj) => {
    if (Object.prototype.toString.call(acc) !== '[object Object]' && !Array.isArray(acc)) {
      // 基本类型及undefined等直接赋值
      acc = mergeObj
      return acc
    }
    return Object.keys(mergeObj).reduce((subAcc, key) => {
      // 遍历对象及数组
      const mergeValue = mergeObj[key] // 将要被合并的对象
      if (Object.prototype.toString.call(mergeValue) === '[object Object]') {
        subAcc[key] = deepMerge(subAcc[key], mergeValue)
      } else if (Array.isArray(mergeValue)) {
        subAcc[key] = subAcc[key] ? subAcc[key] : []
        subAcc[key] = mergeValue.map((item, index) => {
          if (Object.prototype.toString.call(item) === '[object Object]' || Array.isArray(item)) {
            return deepMerge(subAcc[key][index], item)
          }
          return item
        })
      } else {
        subAcc[key] = mergeValue
      }
      return subAcc
    }, acc)
  }, target)
}
exports.deepMerge = deepMerge

const prettierConfig = {
  ...require(path.join(__dirname, '../template/_prettierrc.js')),
  parser: 'babel',
}
exports.prettierConfig = prettierConfig
exports.getPrettierCjsStr = (obj, prettierCustomConfig = {}) => {
  const main = config =>
    Object.keys(config).reduce((acc, key) => {
      const checkValue = config[key]
      if (
        Object.prototype.toString.call(checkValue) === '[object Object]' ||
        Array.isArray(checkValue)
      ) {
        acc[key] = main(checkValue)
      } else {
        if (
          [Infinity, -Infinity, NaN].includes(checkValue) ||
          Object.prototype.toString.call(checkValue) === '[object RegExp]'
        ) {
          acc[key] = `#${checkValue.toString()}#`
        } else if (checkValue === undefined) {
          acc[key] = '#undefined#'
        } else {
          acc[key] = checkValue
        }
      }
      return acc
    }, config)

  return prettier.format(`module.exports=${JSON.stringify(main(obj)).replace(/"#|#"/g, '')}`, {
    ...prettierConfig,
    ...prettierCustomConfig,
  })
}

exports.mergeIgnore = (ignoreTplPath, ignoreTargetPath) => {
  const tplArr = fs
    .readFileSync(ignoreTplPath, { encoding: 'utf8' })
    .split(/\n|\r/)
    .filter(i => i)
  const targetArr = fs
    .readFileSync(ignoreTargetPath, { encoding: 'utf8' })
    .split(/\n|\r/)
    .filter(i => i)
  const removalDuplicates = [...new Set([...tplArr, ...targetArr])].reduce((acc, item) => {
    acc += item + '\n'
    return acc
  }, '')
  fs.writeFileSync(ignoreTargetPath, removalDuplicates)
}
