import fs from 'fs'
import path from 'path'
import spawn from 'cross-spawn'
import { spinnerAll, deepMerge } from './../../utils/global'

export default async (targetPath, pkg = {}) =>
  new Promise(resolve => {
    spinnerAll.start('package.json')

    const basePkg = {
      // version: '0.0.1',
      private: false,
      description: 'initial demo',
      keywords: [],
      main: 'index.js',
      browserslist: 'last 2 versions, > 1%, not dead',
      author: '',
      email: '',
      files: [],
      homepage: 'https://github.com',
      bugs: {
        url: 'https://github.com',
      },
      repository: {
        type: 'git',
        url: 'https://github.com',
      },
      publishConfig: {
        tag: 'latest',
        registry: 'https://registry.npmjs.org/',
        access: 'public',
      },
      license: 'MIT',
    }

    Object.keys(basePkg).forEach(
      key =>
        (pkg[key] = Object.prototype.hasOwnProperty.call(pkg, key) ? deepMerge(basePkg[key], pkg[key]) : basePkg[key])
    )

    fs.writeFileSync(
      path.join(targetPath, 'package.json'),
      JSON.stringify(
        pkg,
        null,
        2
      )
    )
    spinnerAll.succeed('package.json')

    spinnerAll.start('pnpm install')
    spawn('pnpm i', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
      if (code == 0) {
        spinnerAll.succeed('pnpm install')
        resolve()
      }
    })
  })
