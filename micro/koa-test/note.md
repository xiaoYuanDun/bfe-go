# 一点思考和收获

- koa 通过属性赋值，委托模式，构建 context, request, response, res, req 之间的联系

- 核心应该是中间件，实际上复杂应用都是通过扩展中间件来实现的，而且真正处理请求的也只是其中一个中间件而已

- response 代理了几乎所有原始 res 的属性，如 body, headers, statusCode 等等，并且扩展了很多工具方法，如 set, has 等。我们通过 ctx.body 这种快捷方式操作 body 时，实际上是在操作 response.body，其他属性同理

- 每次新的请求到达，都会生成 app, ctx, req, res 等关键对象，用于扩展和描述原始 req/res，

### body

- 我们在设置 body 时，实际上是设置 response 上的 `_body`，并且其 set 方法会拦截并处理我们的赋值操作，针对不同的赋值类型就行特异处理。同时，在经过用户自定义的 body 赋值之后，最终会以洋葱模型的形式，回到 koa 定义的最后一个 `handleResponse` 中，这里同样会进行一个针对 body 类型的特异化处理。这就解释了为什么我们在使用时，可以直接给 ctx.body 赋值字符串，可读流等不同类型，而浏览器却可以正确拿到返回值

- g
