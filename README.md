# WormAndGrass

## 开发语言和库
---
基于JavaScript运行环境

使用TypeScript语言开发

不仅仅是普通2D Canvas，需能使用GPU渲染，选择 PIXI.js

## 开发环境搭建
---
尽量最少的依赖：目前看只需要将ts文件自带编译为js就可以，选择用esbuild

1. ### 安装配置VSCode 1.74.2
    LiveServer插件 用来启动 Web Server
2. ### 安装配置 Node
    nodejs.org下载 18.12.1  LTS

    windows cmd：npm config list

    设置npm安装程序时的默认位置

    ```
    npm config set prefix "D:\npm_modules\global" 
    ```
    设置npm安装程序时的缓存位置
    ```
    npm config set cache "D:\npm_modules\cache" 
    ```
    把 D:\nodejs\node_global 加到 window s系统 PATH 下

    设置淘宝源镜像
    ```
    npm config set registry https://registry.npm.taobao.org
    ```

3. ### 安装 esbuild
    ```
    npm install -g esbuild 
    ```
    
    确认 esbuild
    ```
    esbuild --version
    ```
    如果在vscode终端报错，“。。。因为在此系统上禁止运行脚本”，是powershell问题，在改该powershell终端下
    ```
    Set-ExecutionPolicy -Scope CurrentUser
    输入：RemoteSigned
    ```
    尝试是否能正常将ts文件转换位js文件
    ```
    esbuild .\js\test.ts --bundle --outfile=".\js\test.js"
    ```
