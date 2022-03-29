const http = require('http');
const fs = require('fs');
const path = require('path');
const Stream = require('stream');

const statuses = require('statuses');

const context = require('./context');
const request = require('./request');
const response = require('./response');
const compose = require('./compose');

class Application {
  constructor(options) {
    options = options || {};

    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);

    this.middlewares = [];
  }

  // 启动服务
  listen(...args) {
    const server = http.createServer(this.callback());

    return server.listen(...args);
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('must be a function');
    this.middlewares.push(fn);
    return this;
  }

  /**
   * 这里产生响应主函数，同时初始化中间件
   * 初始化 核心context 对象
   */
  callback() {
    const composeFn = compose(this.middlewares);
    const internalCallback = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, composeFn);
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

  handleRequest(ctx, composeFn) {
    const res = ctx.res;
    res.statusCode = 404; // 默认状态码初始值都是 404
    const response = () => this.handleResponse(ctx);
    const error = (err) => ctx.onError(err);

    return composeFn(ctx).then(response).catch(error);
  }

  handleResponse(ctx) {
    const res = ctx.res;
    let body = ctx.body;
    const code = ctx.status;

    // 当状态码属于无响应体的响应时，走这个逻辑，比如，204，205，304 都不需要响应体
    if (statuses.empty[code]) {
      ctx.body = null;
      res.end();
      return;
    }

    if (body === null || body === undefined) {
      // body 是被用户明确手动设置为 null 的，这时删除一些不必要的 headers
      if (ctx.response._explicitNullBody) {
        ctx.response.remove('Content-Type');
        ctx.response.remove('Transfer-Encoding');
        ctx.length = 0;
        return res.end();
      }

      // todo，兜底处理，这里逻辑还不完善
      if (!res.headersSent) {
        body = ctx.message || String(code);
        ctx.type = 'text';
        ctx.length = Buffer.byteLength(body);
      }
      return res.end(body);
    }

    // 当响应内容为流
    if (body instanceof Stream) return body.pipe(res);

    // ...处理各种类型的响应
    // if() {}

    // 当响应内容为普通文本时，把他们转换为 json
    body = JSON.stringify(body);
    if (!res.headersSent) {
      ctx.length = Buffer.byteLength(body);
    }
    res.end(body);
  }
}

module.exports = Application;
