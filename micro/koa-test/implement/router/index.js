const http = require('http');
const compose = require('../compose');
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
 * 这就是官方文档所说的 route.verb()
 * 注册 http 请求方法的便捷调用形式，因为一般我们使用路由注册的形式都是:
 *   router.get('/xxx', (ctx) => { ... })
 *   router.post('/yyy', (ctx) => { ... })
 *   router.del('/zzz', (ctx) => { ... })
 *
 * verb 方法，可以给路由起别名，如：
 *   router.get('getPerson', '/get-person/:name', (ctx, next) => { ... })
 *   'getPerson' 就是当前路由配置对象的别名，不过就我自己来说，在开发中比较少用
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

    this.register(path, [method], middleware, { name });

    return this;
  };
});

/**
 * 这里是真正通过我们的配置，创建路由处理对象的地方
 */
Router.prototype.register = function (path, methods, middleware, opts = {}) {
  var route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || '',
    ignoreCaptures: opts.ignoreCaptures,
  });

  // 所有的路由规则及处理逻辑，都在这里存储
  this.stack.push(route);
  return route;
};

/**
 * 这是 koa-router 的核心方法
 *
 * 这里会把所有的路由信息组装成一个路由中间件，参数必须按照 koa中间件 的格式(ctx, next)
 * 这里是 koa-router 真正遍历 layer，处理匹配的逻辑所在
 *
 * 而在对 layerChain 进行 reduce 的过程中，每次都会往当前 layer.stack 前添加一个前置函数
 * 这个前置函数的作用是，在真正进入我们配置的 layer.stack 之前，对路由参数做一些集中处理，
 * 构造出 captures，parames，routerPath 等实用属性，挂载到 ctx 上。这样当流程进行到真正
 * 的处理逻辑时，可以比较方便的拿到这些数据
 *
 * 这个前置函数最终会和每个 layer.stack 一起，通过 compose 合并成一个新的中间件
 *
 * 实际上，外层 dispatch 中间件的内容，最终是被转发到由 layerChain 组合而成的新的中间件来处理的 --> compose(layerChain)(ctx, next)
 */
Router.prototype.routes = function () {
  const router = this;

  const dispatch = function (ctx, next) {
    const path = ctx.path;
    const matched = router.match(path, ctx.method);

    if (!matched.route) return next(); // 没有匹配任何一个路由，直接进行下一个中间件逻辑，跳出路由逻辑

    const matchedLayers = matched.pathAndMethod;
    const layerChain = matchedLayers.reduce((memo, layer) => {
      memo.push((ctx, next) => {
        ctx.captures = layer.captures(path);
        ctx.params = layer.params(path, ctx.captures, ctx.params);
        ctx.routerPath = layer.path;
        return next();
      });
      return memo.concat(layer.stack);
    }, []);

    return compose(layerChain)(ctx, next);
  };
  return dispatch;
};

/**
 * 遍历 stack 中所有的 layer（路由配置对象）
 * 拿到所有可能的匹配结果
 */
Router.prototype.match = function (path, method) {
  const layers = this.stack;
  let layer;

  // path 记录所有 url 匹配的情况
  // pathAndMethod 记录所有 url 匹配，且请求方法也匹配的情况
  const matched = {
    path: [],
    pathAndMethod: [],
    route: false,
  };

  for (let i = 0; i < layers.length; i++) {
    layer = layers[i];

    // 验证每个 layer 的匹配情况, 有可能存在多个匹配结果
    // todo，这里我不太理解为什么需要 path 数组，记录它有什么意义吗
    // 明明可以直接 if(layer.match(path) && !!~layer.methods.indexOf(method)) 来判断的
    if (layer.match(path)) {
      matched.path.push(layer);

      if (!!~layer.methods.indexOf(method)) {
        matched.pathAndMethod.push(layer);
        matched.route = true;
      }
    }
  }
  return matched;
};

// TODO, 非核心方法，有空再来看吧
// Router.prototype.prefix           --> 遍历 router.stack, 调用每个 layer 的 setPrefix
// Router.prototype.use              --> 可用于嵌套路由，实现原理和上面差不多
// Router.prototype.allowedMethods   --> ...
// Router.prototype.all
// Router.prototype.redirect
// Router.prototype.route
// Router.prototype.url
// Router.prototype.param

module.exports = Router;
