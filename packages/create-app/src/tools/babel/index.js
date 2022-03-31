import path from 'path'
import copy from './../../utils/copy'
import { spinnerAll, getLatestVersion } from './../../utils/global'

export default async targetPath => {
  spinnerAll.start('babel')
  copy(path.join(__dirname, 'babel.config.js'), path.join(targetPath, 'babel.config.js'))

  const latestVersions = await Promise.all([
    getLatestVersion('@babel/runtime-corejs3'),
    getLatestVersion('@babel/core'),
    getLatestVersion('@babel/plugin-transform-runtime'),
    getLatestVersion('@babel/preset-env'),
  ])

  spinnerAll.succeed('babel')

  return {
    pkg: {
      dependencies: {
        '@babel/runtime-corejs3': `^${latestVersions[0]}`,
      },
      devDependencies: {
        '@babel/core': `^${latestVersions[1]}`,
        '@babel/plugin-transform-runtime': `^${latestVersions[2]}`,
        '@babel/preset-env': `^${latestVersions[3]}`,
      },
    },
  }
}
