const fs = require('fs')
const path = require('path')
const copy = require('./copy')
const getPkgJson = require('./getPkgJson')
const { tplPath, spinner } = require('./global')

/**
 * @method createNewProject
 * @param {string} targetPath
 */
module.exports = async targetPath => {
  spinner.start('模板文件复制')
  fs.mkdirSync(targetPath, { recursive: true })
  copyTemplates(targetPath) // 极快的本地io
  spinner.succeed('模板文件复制')
  fs.writeFileSync(
    // 涉及网络异步io
    path.join(targetPath, 'package.json'),
    JSON.stringify(await getPkgJson(), null, 2)
  )
}

function copyTemplates(targetPath) {
  const files = fs.readdirSync(tplPath)
  for (const file of files) {
    copy(path.join(tplPath, file), path.join(targetPath, file))
  }
}
