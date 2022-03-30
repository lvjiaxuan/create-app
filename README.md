# @lvjiaxuan/create-app

新项目初始化 or 旧项目扩展。

## 用法

初始化一个新项目：
```bash
# 方式1 todo
# npm create @lvjiaxuan/app --registry=https://npm.pkg.github.com

# 方式2
npm i @lvjiaxuan/app -g --registry=https://npm.pkg.github.com
lv init <project-name> [tools-name...]
```

为旧项目添加工具：
```bash
npm i @lvjiaxuan/app -g --registry=https://npm.pkg.github.com
lv add <tool-name...>
```

> 根据当前 *cwd* 是否存在 *package.json* 来判断是否为项目，若无“项目”，`add` 命令会自动创建一个

## 可选的工具 <tool-name...>

- husky: git + husky + lint-staged
- prettier: prettier
- eslint: eslint
- babel: @babel/preset-env + @babel/plugin-transform-runtime + @babel/runtime-corejs3
- commitizen: commitizen with customizable config

> 特点：每个工具都会安装最新的版本号

# 自动安装的

- git init, include `.gitignore`
- 添加更多`package.json`字段属性

# notes

- 各工具的配置文件、version都是直接覆盖
- 请按需编辑 *_husky/_/post-commit|pre-commit*，参考→[husky](https://typicode.github.io/husky/#/?id=create-a-hook)
- WIP

# todo

- [ ] check pnpm