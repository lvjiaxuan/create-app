const path = require('path')
const ncu = require('npm-check-updates')
const ncuDepsPath = path.join(__dirname, '../deps_json/index.json')
const depsInfo = require(ncuDepsPath)
const { spinnerAll, deepMerge } = require('./global')

module.exports = async (pkg = {}, passNCU = false) => {
  spinnerAll.start('(dev)dependencies updates')
  const upgraded = passNCU ? {} : await ncu.run({
    // Pass any cli option
    packageFile: ncuDepsPath,
    upgrade: false,
  })
  spinnerAll.succeed('(dev)dependencies updates')
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
      type: 'git',
      url: 'https://github.com',
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
    dependencies: passNCU ? (pkg.dependencies ?? {}) : deepMerge(pkg.dependencies, depsInfo.dependencies),
    devDependencies: passNCU ? (pkg.devDependencies ?? {}) : deepMerge(pkg.devDependencies, depsInfo.devDependencies),
  }
}
