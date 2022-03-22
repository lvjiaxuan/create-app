const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const { spinnerAll, deepMerge } = require('./../../utils/global')

module.exports = async (targetPath, pkg = {}) =>
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
      homepage: 'https://github.com',
      bug: {
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

    spinnerAll.start('npm install')
    spawn('npm i', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
      if (code == 0) {
        spinnerAll.succeed('npm install')
        resolve()
      }
    })
  })
