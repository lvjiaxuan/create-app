module.exports = {
  env: {
    node: true,
    // commonjs: true,
    // browser: true,
    es6: true, // for globals and syntax
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
  },
  rules: {
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
}
