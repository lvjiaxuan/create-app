# @lvjx/create-app

一个工程化工具安装的工具，旨在创建新项目或扩展旧项目。

## 用法

初始化一个新项目：
```bash
# 方式1
npm init @lvjx/app

# 方式2
npm init @lvjx/create-app -g
lv init <project-name> [tools-name...]
```

为旧项目添加工具：
```bash
npm i @lvjx/create-app -g
lv add <tool-name...>
```

> 根据当前`cwd`是否存在`package.json`来判断是否为项目，若无“项目”，add命令会创建一个

# 可选的工具

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
- 请按需编辑`_husky/_/post-commit|pre-commit`，参考→[husky](https://typicode.github.io/husky/#/?id=create-a-hook)
- 更多更合适的场景进行中......

# todolist

- [ ] auto release
