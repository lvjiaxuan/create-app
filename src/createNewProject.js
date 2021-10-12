const fs = require('fs')
const { deepMerge } = require('./global')

module.exports = async (targetPath, tools) => {
  fs.mkdirSync(targetPath, { recursive: true })

  let pkg = {}
  const cliFuns = []
  const promises = tools.map(async item => {
    const res = await require(`./../template/${item}`)(targetPath)
    res.pkg && (pkg = deepMerge(pkg, res.pkg))
    res.cliFun && cliFuns.push(res.cliFun)
    return Promise.resolve()
  })

  await Promise.all(promises)
  await require('./../template/package')(targetPath, pkg)

  cliFuns.forEach(fun => fun())
}
