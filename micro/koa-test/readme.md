# koa 源码通关

### 最简 koa 实例

- 首先通过一段代码看看，如何启动一个最简单的 koa 服务：new 一个实例，注册响应回调，启动监听，完事了，非常简单

```js
// so easy
const Koa = require('koa');
const app = new Koa();

app.use((ctx) => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);
```

---

### init

##### 初始化 koa 对象 app, 初始化数据接口

### listen

##### 使用 listen 方法启动服务, 方法内部启动默认服务器,

##### 初始化 callback 处理函数,

##### 进行端口监听

### use

##### use 函数可以将中间件加入中间件队列, 函数返回自身, 支持链式调用

### callback

##### callback 接受参数为原始 (req, res), 内部首先处理中间件处理流程逻辑(洋葱模型), 把中间件队列组合成一个新的 composeFn, 新函数接受 (ctx, next) 对象作为参数, 在看源码的过程中发现, 首次调用时, 其实并没有使用这个 next 参数, 所以自己重写时暂时放弃这个参数, 新方法会在一次请求到达时被触发

##### 官方 compose 函数具体实现放在 koa-compose 库中, 其主要逻辑是: 首先判断中间件队列是否为一个数组, 若为数组, 其中的每一项是否为可执行函数, 其次定义一个 dispatch 函数, 作用是调用指定的中间件, 从第一个中间件开始, 在每个中间件中加入可以执行下一个中间件的 dispatch 函数, 赋值给 next 参数, 通过内部维护一个 index 下标来控制每个中间件的 next 方法只能执行一次, 然后默认返回 dispatch(0), 开始执行洋葱模型的流程

```
middleware = [mw1, mw2, ..., mwn]

mw1 = (ctx, next) => { ... }
mw2 = (ctx, next) => { ... }
...
mwn = (ctx, next) => { ... }


(
  ctx,
  (                     // next_0
    ctx,
    (                       // next_1
      ctx,
      () => {                   // next_2
        // ... 无限向内
      }                             // ... next_n
    ) => {
      next()                    // next_2 调用
    }
  ) => {
    next()                  // next_1调用
  }
) => {
  next()                // next_0 调用
}

```

##### 真正的请求处理函数, 其实也会被当成中间件处理(因为是使用 use 添加的), 因为函数体内没有调用 next, 所以此函数就是执行流程的最内层, 之后执行流程会沿着中间件执行方向反向执行完毕, 其实就是个递归, 和 redux 中间件有点相似

##### 这里其实是有个隐形的 next 被传入, 但是此 next 的引用为 dispatch(ctx, mws.length), mws.length 已经超过中间件数组最大下标, 所以根本取不到任何值

```
app.use(async (ctx) => {
  console.log('---');
  ctx.body = 'hi';
  console.log('+++');
});
```

##### 同时, 上面提到的新方法在一个请求到达时被触发, 函数内部会初始化上下文对象 ctx, 此对象会在所有的中间件函数中当成参数被传递

##### 官方的 compose 在组合中间件流的时候会给每个中间件包裹 peomise 外壳(Promise.resolve(mw())), 这样可以同时兼容 同步/异步中间件, 若是同步方法, 返回值会被包在一个新的 promise 中返回, 其余就是一些边界值处理和错误处理逻辑了

### context

#####

### 参考资料

- [koa 源码的整体架构, 洋葱模型](https://juejin.cn/post/6844904088220467213)
