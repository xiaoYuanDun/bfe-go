# 一点思考和收获

## koa

- koa 通过属性赋值，委托模式，构建 context, request, response, res, req 之间的联系

- 核心应该是中间件，实际上复杂应用都是通过扩展中间件来实现的，而且真正处理请求的也只是其中一个中间件而已

- response 代理了几乎所有原始 res 的属性，如 body, headers, statusCode 等等，并且扩展了很多工具方法，如 set, has 等。我们通过 ctx.body 这种快捷方式操作 body 时，实际上是在操作 response.body，其他属性同理

- 每次新的请求到达，都会生成 app, ctx, req, res 等关键对象，用于扩展和描述原始 req/res，

- 我们在设置 body 时，实际上是设置 response 上的 `_body`，并且其 set 方法会拦截并处理我们的赋值操作，针对不同的赋值类型就行特异处理。同时，在经过用户自定义的 body 赋值之后，最终会以洋葱模型的形式，回到 koa 定义的最后一个 `handleResponse` 中，这里同样会进行一个针对 body 类型的特异化处理。这就解释了为什么我们在使用时，可以直接给 ctx.body 赋值字符串，可读流等不同类型，而浏览器却可以正确拿到返回值

- koa 的核心逻辑其实就是，通过 `koa-compose(洋葱模型)` 实现中间件的扩展，并且会把一次请求抽象为一组对象，并且提供一些便捷方法让我们可以按照自身的逻辑去处理请求和响应，同时做一些兜底的错误捕获等等

## koa-router

- 核心方法

  1. `Router.prototype.register`
  2. `Router.prototype.register`

- 核心使用方法是

  1. 产生 router 实例
  2. 注册路由及其对应的处理函数（实际上就是一个个中间件）
  3. 调用 `routes` 返回总体路由中间件（koa.use(routers)）

- 演进过程

  1. 其实没有 koa-router 也可以处理路由，只不过这样会有大量的重复逻辑，且初始化文件会变得混乱，不易维护，我们想要的方案是单独分离出路由配置
  2. 所以我们用 koa-router 把路由信息抽离到一个单独的 router 文件中

- 注意的点
  1. 在还原过程中，发现 koa-router 大量使用了 koa 的委托属性，第一次还原过程中因为缺少一些属性委托，导致报错，如 `ctx.method -> ctx.request.method`

# 在学习的过程中，收集到几个挺有用的库

- [parseUrl, 解析请求的 url，并具有缓存功能](https://github.com/pillarjs/parseurl)

- [require-directory, 递归的 require 指定文件夹下的所有文件](https://github.com/troygoode/node-require-directory)

# 几个在学习时参考的文章

- https://juejin.cn/post/7006874471877804062

- https://juejin.cn/post/7006874471877804062
