const path = require('path')

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

exports.spinnerAppend = (() => {
  const appends = []
  const start = append => {
    append && appends.push(append)
    appends.length && spinner.start(`（${appends.length}）` + appends.toString())
  }
  const succeed = append => {
    const idx = appends.findIndex(item => item === append)
    if (idx > -1) {
      appends.splice(idx, 1)
      spinner.succeed(append)
      start()
    }
  }
  return {
    start,
    succeed,
  }
})()

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

exports.prettierConfig = {
  ...require(path.join(__dirname, '../template/_prettierrc.js')),
  parser: 'babel',
}