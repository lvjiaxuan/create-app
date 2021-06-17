const path = require('path')
const fs = require('fs')
const { renameFiles } = require('./global')

module.exports = copy

function copy(src, dest) {
  const stat = fs.statSync(src)
  const srcBasename = path.basename(src)
  const renameDest = path.format({
    dir: path.dirname(dest),
    base: renameFiles[srcBasename] ? renameFiles[srcBasename] : srcBasename,
  })
  if (stat.isDirectory()) {
    copyDir(src, renameDest)
  } else {
    fs.copyFileSync(src, renameDest)
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}