# 用 Node.js 写简易爬虫
> 2016-07-31 01:23:00

---

## 爬虫

> 网络爬虫（又被称为网页蜘蛛，网络机器人，在FOAF社区中间，更经常的称为网页追逐者），是一种按照一定的规则，自动地抓取万维网信息的程序或者脚本。

说到爬虫一般都会想到 Python,但是比起 Python, 会 Javascript应该更多.
然后刚好我就用 Node.js 写了一个简单的爬虫, 爬取输入的优酷视频的 url 并且读取所需信息在网页上显示出来,并且在终端中用 json 显示.
Github: https://github.com/TBXark/YoukuInfo



## Node.js

> Node.js采用Google的V8引擎来执行代码。Node.js的大部分基本模块都是用JavaScript写成的。Node.js含有一系列内置模块，使得程序可以作为独立服务器运行，从而脱离Apache HTTP Server或IIS运行。

首先介绍一下接下来或用到的一些依赖

1. `superagent` : 是nodejs里一个非常方便的客户端请求代理模块
2. `express` : 是一个简洁而灵活的node.js Web应用框架, 提供一系列强大特性帮助你创建各种Web应用
3. `cheerio` : jQuery 的 Node.js 实现
4. `body-parser` : 用来解析请求体, 没有这个库的话 express 会解析不出 post 中的请求体
5. `fs`: 用来读取本地文件


## 代码解析

### 1. 引用依赖

```
var superagent = require('superagent');
var express = require('express');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var fs = require("fs");

```

### 2. 初始化

```
var app = express(); // 创建 `express` 对象

app.use(bodyParser.json()); // 请求体解析
app.use(bodyParser.urlencoded());

// 创建路由: 路由表示应用程序端点 (URI) 的定义以及端点响应客户机请求的方式
var router = express.Router();

// 主页
app.get('/', router);
// 结果页
app.post('/showdetail', router);

```

### 3. 首页

1. 首页内容

使用表单作为需要爬取的 url 的输入源.
将`<form>`的 id 设置成`urlinput`, 然后将 `<textarea>` 的 `from` 设置成 `urlinput`,这样这两个控件就可以关联起来.
然后将加上网络请求 `action='/showdetail' method='post'`. 一个简单的表单提交页面就完成了

```
<form id='urlinput' >
<textarea type='text' name='urls' form='urlinput' style='height: 50%; width:100%'></textarea>
<br>
<br>
<input type='submit' value='Submit' style='width:100%; height:50'>
</form>

```

2. 渲染首页

使用`fs.readFileSync`同步读取存在本地的首页内容并返回给浏览器渲染

```
// 读取 input 文件并且返回
router.get('/', function(req, res){
  var htmlCode =  fs.readFileSync('input').toString();
  res.send(htmlCode);
});

```

### 4. 解析并返回数据

这一块写得比较粗糙,主要是将 post 请求体中的内容读取出来并且分割成数组,然后遍历 url 并且爬取相应的数据.
使用`cheerio`能很轻松的解析 html, 详情的语法可以查看`cheerio`的 文档.
将解析出来的内容分别拼接成 json 和 html 并返回

```
router.post('/showdetail', function(req, res){
  var urls = req.body.urls.split("\n");

  var content = "";
  var count = urls.length;

  if (count == 0) {
    return
  }
  for (var index in urls) {
    var url = urls[index];
    if (url.length > 0 && url.indexOf("http://v.youku.com") >= 0) {
        superagent.get(url)
          .end(function (err, sres) {
            count = count - 1;
            if (err) {
              if (count == 0) {
                res.send(content);
              }
              return ;
            }
            var $ = cheerio.load(sres.text);

            var irAlbumName = $('meta[name="irAlbumName"]').attr('content');
            var irTitle = $('meta[name="irTitle"]').attr('content');
            var keywords =  $('meta[name="keywords"]').attr('content');
            var videoCode = $('input[id="link4"]').attr('value');
            var image = $('a[id="s_qq_haoyou1"]').attr('href').split("pics=")[1].split("&")[0].replace("5420", "5410");

            var jsonObj = {
              url: url,
              title: irAlbumName + irTitle,
              keywords: keywords,
              videoCode: videoCode,
              image: image
            };


            var subContent =  "标题:" + "<br>" + irAlbumName + irTitle + "<br>" + "<br>";
            subContent = subContent + "关键词:" + "<br>" + keywords + "<br>" + "<br>";
            subContent = subContent + "缩略图:" + "<br>" + "<img src='"+image+"' />" + "<br>" + "<br>";
            subContent = subContent + "通用代码:" + "<br>" + "<input style='width:100%' value=\'" + videoCode  + "\'</input>" + "<br>" +"<br>" + "<br>" + "<br>";;

            content = content + subContent;

            console.log( JSON.stringify(jsonObj, null, "\t") + "\n");
            if (count == 0) {
              res.send(content);
            }
          });
      } else {
        count = count - 1;
        if (count == 0) {
          res.send(content);
        }
      }
    }
});


```


### 4. 监听端口

最后设置监听的端口, 完成后在终端运行 `node index.js`, 并且在浏览器中访问 `localhost:3000`就可以访问首页并且执行爬虫了

```
app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
```
