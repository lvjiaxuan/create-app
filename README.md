# @lvjx/create-app

基础业务集成工具，帮组你创建新项目，同时也可以扩展你的项目。
# Usage

初始化一个项目
```bash
npm init @lvjx/app
```

使用cli进行增量配置：
```bash
npm i @lvjx/create-app -g
```

```bash
lv add <tool-name...>
```

# tool-name chosen

- husky: git + husky + lint-staged
- prettier: prettier
- eslint: eslint
- babel: @babel/preset-env + @babel/plugin-transform-runtime + @babel/runtime-corejs3
- commitizen: commitizen with customizable config


# Autocomplete

- add more package name
- git init, include `.gitignore`
- ncu

# notes

- 请按需编辑`_husky/_/post-commit|pre-commit`
- 试用中...

---

> https://juejin.cn/post/6966119324478079007