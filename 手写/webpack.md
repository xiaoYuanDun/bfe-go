#### todo

- webpack require 模块缓存

- webpack 如何兼容 ES6 模块

  如果是 commonJS 模块引用 commonJS 模块，无需额外的处理
  如果是 ES6 ,引用 commonJS，ES6 引用 ES6，commonJS 引用 ES6，都会在编译时，把 ES6 模块中的 import/export 进行转化，把 ES6 的默认导出和具名导出的变量通过 `__webpack_require__.d` 函数，挂载到 `exports` 对象上，转化后的代码如下：

  ```js
  var __webpack_modules__ = {
    './src/te.js': (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        default: () => __WEBPACK_DEFAULT_EXPORT__,
      });
      var name = 'xiaoMing';
      const __WEBPACK_DEFAULT_EXPORT__ = name;
    },
  };
  ```

  使用到的 `__webpack_require__.d` 方法如下，其实就是内部就是使用了 `Object.defineProperty` 来处理变量的，给 default 和其他具名变量定义 getter，函数如下：

  ```js
  __webpack_require__.d = (exports, definition) => {
    for (var key in definition) {
      if (
        __webpack_require__.o(definition, key) &&
        !__webpack_require__.o(exports, key)
      ) {
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: definition[key],
        });
      }
    }
  };
  ```

  初始化一个当前 ES6 对象的空 module 对象，内部包含一个空的 exports 对象 `{ exports: {} }`，ES6 导出的内容都会被挂载到 exports 对象上
  然后通过 `__webpack_require__.r` 方法为当前 exports 打上 **esModule** 标识，具体做法是：

  ```js
  __webpack_require__.r = (exports) => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module',
      });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };
  ```

这时，之前通过 ES6 export 导出的变量会全部挂载到这个 exports 对象上，其他模块在引用此模块时，可以通过是否具有 **esModule** 标识来判断这个模块是否是由一个 ES6 模块转换而来的（因为` __webpack_require__.r`），如果是就可以通过 exports.default 拿到原来的默认导出（因为`__webpack_require__.d`），具名导出的变量直接使用 exports[xxx] 就可以拿到, 如果是一个 commonJS 模块，则直接使用即可

- webpack 如何做懒加载，原理是？
  可以参考 手写/懒加载样例

这里只关注几个关键方案，一下代码已经精简过一些了，可能和源码有一点点出入

首先，如果代码中出现了 `import('./xxx')` 这种语法，webpack 会直接把 import 内部的模块单独作为一个 chunk 来打包，当执行到 import 语句时，才会从远程拉取响应的 chunk，也就实现了懒加载

出现这种情况时，webpack 会在主代码块和子 chunk 中同时维护一个 `webpackChunkXxx_xxx` 变量挂载到 self 对象上，浏览器环境下就是 window（Xxx_xxx 是从项目 package.json 中取的 name 值），之后会用到这个变量，源码中是这样：

```js
var chunkLoadingGlobal = (self['webpackChunksimple_webpack_test'] =
  self['webpackChunksimple_webpack_test'] || []);
chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
chunkLoadingGlobal.push = webpackJsonpCallback.bind(
  null,
  chunkLoadingGlobal.push.bind(chunkLoadingGlobal)
);
```

当条件合适，触发 import 语句时，代码如下：

```js
__webpack_require__
  .e(/*! import() */ 'src_title_js')
  .then(
    __webpack_require__.bind(
      __webpack_require__,
      /*! ./title */ './src/title.js'
    )
  )
  .then(function (res) {
    console.log(res['default']);
  });
```

这里看一下 `__webpack_require__.e` 这个方法，是懒加载逻辑中新增的，可以理解为启动一个 chunk 对应的 promise，实际上就是嗲用 `__webpack_require__.f.j` 启动一个 promise，不过我暂时没看懂为什么需要`__webpack_require__.f` 这一层，感觉可以直接调用

```js
__webpack_require__.f = {};
// This file contains only the entry chunk.
// The chunk loading function for additional chunks
__webpack_require__.e = (chunkId) => {
  return Promise.all(
    Object.keys(__webpack_require__.f).reduce((promises, key) => {
      __webpack_require__.f[key](chunkId, promises);
      return promises;
    }, [])
  );
};
```

这里有使用到 `__webpack_require__.f.j`，看一下他们都做了什么

```js
var installedChunks = {
  main: 0,
};
__webpack_require__.f.j = (chunkId, promises) => {
  // JSONP chunk loading for javascript
  var installedChunkData = __webpack_require__.o(installedChunks, chunkId)
    ? installedChunks[chunkId]
    : undefined;
  if (installedChunkData !== 0) {
    // 0 means "already installed".
    // a Promise means "currently loading".
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      if (true) {
        // all chunks have JS
        // setup Promise in chunk cache
        var promise = new Promise(
          (resolve, reject) =>
            (installedChunkData = installedChunks[chunkId] = [resolve, reject])
        );
        promises.push((installedChunkData[2] = promise)); // start chunk loading
        var url = __webpack_require__.p + __webpack_require__.u(chunkId); // create error before stack unwound to get useful stacktrace later
        var error = new Error();
        var loadingEnded = (event) => {
          if (__webpack_require__.o(installedChunks, chunkId)) {
            installedChunkData = installedChunks[chunkId];
            if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
            if (installedChunkData) {
              var errorType =
                event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message =
                'Loading chunk ' +
                chunkId +
                ' failed.\n(' +
                errorType +
                ': ' +
                realSrc +
                ')';
              error.name = 'ChunkLoadError';
              error.type = errorType;
              error.request = realSrc;
              installedChunkData[1](error);
            }
          }
        };
        __webpack_require__.l(url, loadingEnded, 'chunk-' + chunkId, chunkId);
      } else installedChunks[chunkId] = 0;
    }
  }
};
```

先说明一下几个变量的作用`installedChunks` 是用来标识所有 chunk 的加载状态，main 属于主代码块，所以是第一个加载的，所以这里 `installedChunks` 的默认值就是 `{ main: 0 }`，官方的注释是这样写的，这里就不翻译了

```js
// object to store loaded and loading chunks
// undefined = chunk not loaded, null = chunk preloaded/prefetched
// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
```

当`installedChunks`中没有当前`chunkId`时，表示这是第一次加载，需要使用`jsonp`进行远程请求，这里用一个临时变量` installedChunkData` 保存当前`promise`的所有信息 ，同时把当前`promise`放入`promises`数组，import 后面的回调会在 promises 全部完成后执行

```js
installedChunkData = installedChunks[chunkId] = [resolve, reject];
// ...
promises.push((installedChunkData[2] = promise));
```

这时，`installedChunks`会添加当前 chunk 的信息

```js
{
  main: 0,
  'Xxx_xx': [resolve, reject, promise]
}
```

之后准备 script 标签的 url 地址，然后执行`__webpack_require__.l` 方法创建 script 标签，加载远程 chunk

到这里，主代码块的逻辑在同步层面已经执行完了，这时就要等待远程代码块下载完毕，然后触发执行，我们来看一下远程 chunk 是什么样的：

```js
(self['webpackChunksimple_webpack_test'] =
  self['webpackChunksimple_webpack_test'] || []).push([
  ['src_title_js'],
  {
    './src/title.js': (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        val: () => val,
        default: () => __WEBPACK_DEFAULT_EXPORT__,
      });
      var val = 'hahaha';
      const __WEBPACK_DEFAULT_EXPORT__ = 'yoyoyo';
    },
  },
]);
```

可以看到这里的`self['webpackChunksimple_webpack_test']` 是不是很熟悉，就是开头说过的`webpackChunkXxx_xxx` ，由于我们重写过此变量的`push`方法，所以这里调用`push`实际上是调用`webpackJsonpCallback`

```js
// install a JSONP callback for chunk loading
var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
  var [chunkIds, moreModules, runtime] = data;
  // add "moreModules" to the modules object,
  // then flag all "chunkIds" as loaded and fire callback
  var moduleId,
    chunkId,
    i = 0;
  for (moduleId in moreModules) {
    if (__webpack_require__.o(moreModules, moduleId)) {
      __webpack_require__.m[moduleId] = moreModules[moduleId];
    }
  }
  if (runtime) var result = runtime(__webpack_require__);
  if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
  for (; i < chunkIds.length; i++) {
    chunkId = chunkIds[i];
    if (
      __webpack_require__.o(installedChunks, chunkId) &&
      installedChunks[chunkId]
    ) {
      installedChunks[chunkId][0]();
    }
    installedChunks[chunkIds[i]] = 0;
  }
};
```

可以清楚的看到，他会把远程 chunk 中的模块全部拷贝到`__webpack_require__.m`（全局模块存储变量）中，这里注意，一个远程 chunk 中可能包含很多个模块，不要混淆他们俩的概念（远程 chunk 有可能是多个文件通过 import/export 构建的），然后调用当前 chunk 对应的 promise 的 resolve 方法，决议此 promise，修改`installedChunks`状态为

```js
{
  main: 0,
  'Xxx_xx': 0
}
```

标识此 chunk 已经被成功加载，下次在遇到相同 import 时，直接走缓存就行
最后就是一些收尾工作，包括 script.onload ，删除 script 标签等，不是这次关注的重点，就不做介绍了

- webpack 工作流

1. 读取配置文件，命令行输入参数，合并成一个配置对象， `const config = {...webpack.config.js, ...process.args}`

2. 使用配置对象，初始化 compiler 对象，`const compiler = webpack(config)`
   加载所有插件，把他们绑定到对应的周期 hook 上，这样在特定 hook 进行时，就会调用对应插件的 apply 方法

3. 执行 compiler.run，从入口文件开始加载文件**(`entry`)**

4. 解析代码得到 ast，找到入口文件依赖的其他模块，构建模块 id 等信息，然后对依赖的模块进行相同操作（解析 ast，寻找依赖，构建依赖模块信息，编译）
   tips：在一个文件中引入其他文件，使用的是相对路径，而全局的模块缓存中，模块 id 是相对于项目根路径的，所以需要重新构建
   module = { id, name, deps }

这里会得到一个所有 module 的集合，多次引用的模块会做去重处理，类似一个字典结构
