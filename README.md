# dst-cloud-manage
## Overview

这是一个饥荒联机版的服务器管理工具，包含一键部署，mode管理等功能

## Run Setup

  ```bash
  # clone the project
  git clone git@github.com:FuBaooo/dst-cloud-manage.git

  # enter the project directory
  cd dst-cloud-manage

  # install dependency
  pnpm i

  # develop
  pnpm dev
  ```

## Directory

```tree
├
├── dist                      构建之后的目录
├   ├── main
├   ├── preload
├   ├── renderer
├
├── scripts
├   ├── build.mjs             Develop script -> 构建脚本
├   ├── watch.mjs             Develop script -> 开发校本
├
├── packages
├   ├── main                  主线程源代码
├       ├── vite.config.ts
├   ├── preload               预加载源代码
├       ├── vite.config.ts
├   ├── renderer              主线程源代码
├       ├── locales           语言包
├       ├── src               
├            ├── pages        页面由路径自动生成
├            ├── modules      装载的模块
├       ├── vite.config.ts
├
```