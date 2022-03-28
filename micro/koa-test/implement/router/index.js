const http = require('http');
const Layer = require('./layer');
/**
 * koa-router 实现
 */

function Router(opts) {
  if (!(this instanceof Router)) return new Router(opts);

  this.opts = opts || {};
  this.stack = [];
  this.methods = this.opts.methods || [
    'HEAD',
    'OPTIONS',
    'GET',
    'PUT',
    'PATCH',
    'POST',
    'DELETE',
  ];
}

/**
 * 注册 http 请求方法的便捷调用形式，因为一般我们使用路由注册的形式都是:
 *   router.get('/xxx', (ctx) => { ... })
 *   router.post('/yyy', (ctx) => { ... })
 *   router.del('/zzz', (ctx) => { ... })
 */
const methods = http.METHODS.map((method) => method.toLowerCase());
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;

    if (typeof path === 'string' || path instanceof RegExp) {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, [method], middleware, {
      name: name,
    });

    return this;
  };
});

/**
 * 这里是真正通过我们的配置，创建路由处理对象的地方
 */
Router.prototype.register = function (path, methods, middleware, opts) {
  opts = opts || {};
  const stack = this.stack;

  var route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || '',
    ignoreCaptures: opts.ignoreCaptures,
  });

  // 所有的路由规则及处理逻辑，都在这里存储
  stack.push(route);
  return route;
};

Router.prototype.use = function () {};

/**
 * 这里会把所有的路由信息组装成一个路由中间件
 */
Router.prototype.routes = function () {
  const router = this;

  // 因为这里返回的是一个中间件，所以参数必须按照 koa中间件 的格式(ctx, next)
  const dispatch = function (ctx, next) {
    const path = ctx.path;
  };
  return dispatch;
};

/**
 * 用来校验每一次请求是否匹配当前的路由配置
 */
Router.prototype.match = function (path, method) {
  const layers = this.stack;
  let layer;

  const matched = {
    path: [],
    route: false,
  };

  for (let i = 0; i < layers.length; i++) {
    layer = layers[i];

    // 验证每个 layer 的匹配情况, 有可能存在多个匹配结果
    if (layer.match(path)) {
      matched.path.push(layer);

      if (!!~layer.methods.indexOf(method)) {
        // matched.pathAndMethod.push(layer);
        matched.route = true;
      }
    }
  }

  return matched;
};

module.exports = Router;
