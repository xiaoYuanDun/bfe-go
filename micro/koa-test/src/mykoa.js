const http = require('http');
const compose = require('./compose');

class MyKoa {
  constructor() {
    this.middleware = [];
    this.context = {};
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  callback() {
    const composeFn = compose(this.middleware);
    const _handleRequest = (req, res) => {
      const ctx = {
        request: req,
        rea: req,
        response: res,
        res,
      };
      return this.handleRequest(ctx, composeFn);
    };
    return _handleRequest;
  }

  handleRequest(ctx, composeFn) {
    // handleResponse 需要使用 ctx, 在这里提前持有
    const _handleResponse = () => this.handleResponse(ctx);
    return composeFn(ctx).then(_handleResponse);
  }

  handleResponse(ctx) {
    // ctx.res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    ctx.res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    ctx.res.end('响444');
  }

  listen(port) {
    const server = http.createServer(this.callback());
    server.listen(port);
    console.log('服务启动, 监听端口: ', port);
  }
}

module.exports = MyKoa;
