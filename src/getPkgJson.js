const { deepMerge } = require('./global')

module.exports = (pkg = {}) => ({
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
  dependencies: {},
  devDependencies: {},
  ...pkg,
})
