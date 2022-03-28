const { pathToRegexp } = require('path-to-regexp');

/**
 * 个人理解，一个路由匹配规则，就对应一个 layer
 */
function Layer(path, methods, middleware, opts) {
  this.opts = opts || {};
  this.name = this.opts.name || null;
  this.methods = [];
  this.paramNames = [];

  // 这里存储了真正的逻辑处理主题
  this.stack = Array.isArray(middleware) ? middleware : [middleware];

  for (let i = 0; i < methods.length; i++) {
    const last = this.methods.push(methods[i].toUpperCase());
    //   if(this.methods[last - 1] === 'GET') this.methods.unshift('HEAD')
  }

  this.path = path;
  this.regexp = pathToRegexp(path, this.paramNames, this.opts);
}

Layer.prototype.match = function (path) {
  return this.regexp.test(path);
};

module.exports = Layer;
