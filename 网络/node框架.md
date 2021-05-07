### koa express

TODO

核心就是对 req, res 的封装
比如 req, 可以通过 ctx.request, ctx.req, ctx.request.req 来访问, 其中 ctx.request 是 koa 自己扩展的 request 对象, 其余为原生 req 对象
源码中一共有 4 个文件, application, request, response, context 分别对应 服务器对象, 封装 req, 封装 res, 请求上下文对象
