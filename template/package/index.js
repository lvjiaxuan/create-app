const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const { spinnerAll } = require('./../../src/global')

module.exports = async (targetPath, pkg = {}) =>
  new Promise(resolve => {
    spinnerAll.start('package.json')
    fs.writeFileSync(
      path.join(targetPath, 'package.json'),
      JSON.stringify(
        {
          version: '0.0.1',
          description: 'initial demo',
          private: false,
          keywords: [],
          main: 'index.js',
          browserslist: 'last 2 versions, > 1%, not dead',
          author: '',
          email: '',
          homepage: 'https://github.com',
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
          // 'lint-staged': {
          //   '*': 'prettier -w -u',
          //   '*.{vue,js}': 'eslint --fix',
          // },
          // config: {
          //   commitizen: {
          //     path: './.cz-simple',
          //   },
          // },
          dependencies: {},
          devDependencies: {},
          ...pkg,
        },
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
