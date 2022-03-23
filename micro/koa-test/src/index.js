const http = require('http');
const context = require('./context');
const request = require('./request');
const response = require('./response');

class Application {
  constructor(options) {
    options = options || {};

    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  listen(...args) {
    const server = http.createServer(this.callback());

    console.log('listen on ', args[0]);
    return server.listen(...args);
  }

  /**
   * 这里产生响应主函数，同时初始化中间件
   * 初始化 核心context 对象
   */
  callback() {
    const internalCallback = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx);
    };

    return internalCallback;
  }

  /**
   * 创建 核心context 对象
   * 每次请求会创建一个 context 对象，通过 Object.create 每次构建一个连接到 context 原型的对象
   * 这里拿到的 req，res 对象是 node.httpServer 提供的请求响应对象，可以看到它们的类型，都是流的类型，一个可读流，一个可写流
   *
   * type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
   *   class IncomingMessage extends stream.Readable { ... }
   *   class ServerResponse extends OutgoingMessage { ... } extends stream.Writable { ... }
   *
   * 这里基本工作就是构建一个，代表本次请求过程的对象实体，并构建他们之间的联系
   */
  createContext(req, res) {
    // 构建全新 context 对象，并通过原型连接公共 context；request，response 同理
    const context = Object.create(this.context);
    const request = (context.request = Object.create(this.request));
    const response = (context.response = Object.create(this.response));

    // 共享一些对象
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;

    return context;
  }

  handleRequest(ctx) {
    console.log('got req');

    const response = () => this.handleResponse(ctx);
    return Promise.resolve().then(response);
  }

  handleResponse(ctx) {
    const res = ctx.res;

    // ctx.res.writeHead(200, { 'Content-Type': 'application/json' });
    // ctx.res.end(
    //   JSON.stringify({
    //     data: 'Hello World!',
    //   })
    // );
  }
}

module.exports = Application;
