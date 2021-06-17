module.exports = {
  env: {
    commonjs: true,
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly'
  },
}
