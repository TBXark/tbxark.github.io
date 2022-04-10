# 在node中动态加载代码
> 2022-04-02 12:50:50

---

在 **[ rmock](https://github.com/TBXark/rmock)** 中我需要实现一个逻辑加载一个外部的js代码，对路由进行自定义，然后当外部js文件发生变化时，能够实时更新路由。因为之前开发的时候一直使用`nodemon`，所以我很容易的想到，外部js文件发生变化的时候直接重新启动这个进程就可以了。然后方案一很快的就完成了。



### 方案一：重启进程

外部js文件导出一个`register` 函数

```js
export const register = (router, utils) => {
    const { mapResponse, disableLog, redirect } = utils;
    router.get('/status', mapResponse((res, ctx) => {
      return {
        ...res,
        inject: 'Hello World!'
      };
    }))
};
```

路由动态的`import`这个路径，获得`register`函数并调用

```js
const { register } = await import(DYNAMIC_ROUTER_PATH)
register(router, {...config})
```

监听目标文件，当文件发生变动时候，重载整个进程。

```js
import child_process from "child_process"
import fs from "fs"

process.on("exit", function (code) {
	if(code === 23333) {
    child_process.spawn(
      process.argv.shift(),
      process.argv,
      {
        cwd: process.cwd(),
        detached: true,
        stdio: "inherit"
      }
		);
  }
});

fs.watchFile(DYNAMIC_ROUTER_PATH, () => {
	console.log(`File ${DYNAMIC_ROUTER_PATH} changed, reloading...`);
	process.exit(23333);
});

```

一气呵成写完之后试了一下，没问题。然后准备control+c退出多测试了几次。重新执行命令发现，端口被占用。重开的进程没有被关闭仍人在后台执行，只能通过`lsof`找到然后使用`kill`杀死，特别麻烦。最后多次挣扎也没有解决这个BUG。



### 方案二：重启服务器/重载路由

然后我想到如果我要改变路由配置不一定要重启整个进程，其实我只要重启http服务，或者替换listener就可以了。经过多种方案的对比，最后选择了不重启http服务而是替换listener的方法。

```js
server.removeAllListeners("request");
server.on("request", app.callback());
```



代码写好之后试了一下，文件发生变化的时候确实会替换`requestListener`, 但是并没有执行新的文件中的代码，而是还是原来的代码。后来我发现 `const { register } = await import(DYNAMIC_ROUTER_PATH)` 中的`import`

只会导入一次，之后就算代码发生变化不会导入新的代码。

然后我决定换一个代码导入的方式。



##### 1. `eval` 

最容易想到的执行代码的的函数就是`eval`。 进过测试无法创建外部可用的函数。所以就放弃了。



##### 2. `vm`

`vm` 模块允许在 V8 虚拟机上下文中编译和运行代码。并从上写文中获取变量和函数。

```js
import vm from "vm";

const raw = fs.readFileSync(extenalRouter, "utf8");
const ctx = vm.createContext({})
vm.runInContext(raw, ctx)
const { register } = ctx;
register(router, { mapResponse, disableLog, redirect });
```



##### 3. `Functions` 

`Functions` 可以通过字符创建一个函数。通过拼接字符串实现返回任意想要的内容。

```js
const raw = fs.readFileSync(extenalRouter, "utf8");
const register = new Function(`${raw}\n\nreturn register;`)();
register(router, { mapResponse, disableLog, redirect });
```



### 最后

`Functions` 和`vm` 都能实现我的功能，虽然`vm`的开销会比较大而且在文件不大的情况下消耗的时间都差不多。但是因为是导入用户自己的脚本，不用考虑安全性，而且`vm`也不是特别安全 ，所以劣势不明显。

然后我封装了两个版本的通用导入动态模块的代码。稍微处理一下细节，处理一下错误，使得虽然外部js导入失败也不能导致主程序崩溃。不然在修改外部js的时候，代码没写完，不小心保存了一下，就导致程序崩溃又得重新运行。



`Functions` 版本

```js

function dynamicImport(path, ...modules) {
  let resObj = {}
  console.log(`import { ${modules.join(", ")} } from ${path}`);
  try {
    const raw = fs.readFileSync(path, "utf8");
    const imp =  modules.map(m => {
      return `
      if (typeof ${m} !== 'undefined') {
        _____resObj["${m}"] = ${m}
      } 
      `
    }).join("\n")
    const importer = new Function(`
        const _____resObj = {}
        try {
          ${raw}
          ${imp}
        } catch (error) {
        }
        return _____resObj;
    `);
    console.log(importer.toString())
    resObj = importer();
  } catch (error) {
    console.log("dymanic import error", error);
  }
  return resObj
}

```



`vm`版本

```js
function dynamicImport(path, ...modules) {
  console.log(`import { ${modules.join(", ")} } from ${path}`);
  const vmContext = vm.createContext({});
  try {
    const raw = fs.readFileSync(path, "utf8");
    vm.runInContext(raw, vmContext);
  } catch (error) {
    console.log("dymanic import error", error);
  }
  return modules.reduce((resObj, m) => {
    if (typeof vmContext[m] !== 'undefined') {
      resObj[m] = vmContext[m]
    }
    return resObj
  }, {})
}
```



最后发现`vm`的代码要简洁很多，`Function`要许多奇技淫巧才能实现的功能，`vm`直接就能用。由于测试案例不够多，所以这个最终版的`Function`中不知道还有什么BUG，所以我还是选择了`vm`的版本



