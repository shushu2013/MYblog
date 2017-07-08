# 渐进式微博系统

## 由来
这是我的个人项目，基于[《Node.js开发指南》](https://book.douban.com/subject/10789820/ "豆瓣链接")中的 weibo 项目，结合自己的需求，来
渐进式开发一个微博系统。

## 架构
[Node](https://nodejs.org/ "Nodejs官网")<br>
[Express 4](http://www.expressjs.com.cn/ "Express中文网")<br>
[Mongodb](https://docs.mongodb.com/ "Mongodb官网文档")<br>
[Ejs](http://ejs.co/ "Ejs官网")<br>
[Bootstrap 3](http://www.bootcss.com/ "Bootstrap中文网")

## 安装运行
安装前，确保系统已安装了 [git](https://git-scm.com/downloads "git官网下载")、 [mongodb](https://www.mongodb.com/download-center#community "mongodb官网下载")、 [node](https://nodejs.org/zh-cn/download/ "node中文网下载")(一般都集成了npm)<br>国内的用户可使用 cnpm 加速 npm
可参考：[快速搭建 Node.js / io.js 开发环境以及加速 npm](https://fengmk2.com/blog/2014/03/node-env-and-faster-npm.html)

在 Linux 下安装：

    /*git 克隆项目*/
    $ git clone git@github.com:shushu2013/weibo.git
    
    /*npm 安装模块，（会根据项目目录下 package.json 文件中的配置，自动安装依赖的模块）*/
    $ npm install
    
    /*由于网速原因，国内用户可以使用 cnpm 来安装模块*/
    $ cnpm install

安装完成后，在项目目录下，可使用以下两种方式运行

    1、在命令行下，直接用 node 启动
        $ node app.js
        
    2、使用 microblog.sh 脚本（仅在Linux环境下可用）
        启动程序运行 $ ./microblog.sh start
        结束程序运行 $ ./microblog.sh stop

## 版本及功能

>当前版本：v1.0
>
>基础版本：v1.0
>
>功能：
>   >用户登录、注册，发表微博、浏览所有微博、浏览自己的主页
>   >
>   >使用本地 Mongodb 数据库存储数据
>   

## LICENSE
Repos open sourced under the shushu GitHub account is licensed under Apache 2.0 by default.
