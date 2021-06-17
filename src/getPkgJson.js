const path = require('path')
const ncu = require('npm-check-updates')
const ncuDepsPath = path.join(__dirname, '../deps_json/index.json')
const depsInfo = require(ncuDepsPath)
const { spinnerAppend, deepMerge } = require('./global')

module.exports = async (pkg = {}) => {
  spinnerAppend.start('npm check updates')
  const upgraded = await ncu.run({
    // Pass any cli option
    packageFile: ncuDepsPath,
    upgrade: false,
  })
  spinnerAppend.succeed('npm check updates')
  Object.keys(upgraded).forEach(dep => {
    if (Object.prototype.hasOwnProperty.call(depsInfo.dependencies, dep)) {
      depsInfo.dependencies[dep] = upgraded[dep]
    } else if (Object.prototype.hasOwnProperty.call(depsInfo.devDependencies, dep)) {
      depsInfo.devDependencies[dep] = upgraded[dep]
    }
  })
  return {
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
      type: 'git or svn',
      url: '',
    },
    publishConfig: {
      tag: 'latest',
      registry: 'https://registry.npmjs.org/',
      access: 'public',
    },
    license: 'MIT',
    'lint-staged': {
      '*': 'prettier -w -u',
      '*.{vue,js}': 'eslint --fix',
    },
    config: {
      commitizen: {
        path: './.cz-simple',
      },
    },
    ...pkg,
    dependencies: deepMerge(pkg.dependencies, depsInfo.dependencies),
    devDependencies: deepMerge(pkg.devDependencies, depsInfo.devDependencies),
  }
}
