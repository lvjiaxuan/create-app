const fs = require('fs')
const { deepMerge } = require('./utils/global')

module.exports = async (targetPath, toolsName, pkg) => {

  // 1. 创建文件夹
  fs.mkdirSync(targetPath, { recursive: true })
  await require('./tools/git')(targetPath).then(async tool => await tool.cliFun())

  // 2. 生成package.json
  const toolCliFuns = []
  const toolActions = toolsName.map(async item => {
    const res = await require(`./tools/${item}`)(targetPath)
    res.pkg && (pkg = deepMerge(pkg, res.pkg))
    res.cliFun && toolCliFuns.push(res.cliFun)
    return Promise.resolve()
  })
  await Promise.all(toolActions)
  await require('./tools/package')(targetPath, pkg)

  // 3. npm install 之后才能做的事情
  toolCliFuns.forEach(fun => fun())
}
