const { pathToRegexp } = require('path-to-regexp');

/**
 * 个人理解，一个路由匹配规则，就对应一个 layer
 */
function Layer(path, methods, middleware, opts) {
  this.opts = opts || {};
  this.name = this.opts.name || null;
  this.methods = [];

  // 会在每次实例化 Layer 时，由 pathToRegexp 负责更新，和 path 中的 :xxx 一一对应
  this.paramNames = [];

  // 这里存储了真正的逻辑处理主题
  this.stack = Array.isArray(middleware) ? middleware : [middleware];

  for (let i = 0; i < methods.length; i++) {
    const last = this.methods.push(methods[i].toUpperCase());
    //   if(this.methods[last - 1] === 'GET') this.methods.unshift('HEAD')
  }

  this.path = path;
  if (opts.prefix) this.path = opts.prefix + this.path;

  this.regexp = pathToRegexp(path, this.paramNames, this.opts);
}

/**
 * 返回当前 请求url 的匹配情况
 */
Layer.prototype.match = function (path) {
  return this.regexp.test(path);
};

/**
 * 如果存在分组，在这里按照分组顺序拿到所有匹配到的分组值
 * path.match 的第一个数组项是全局匹配段，之后才是每个分组等匹配情况
 */
Layer.prototype.captures = function (path) {
  return this.opts.ignoreCaptures ? [] : path.match(this.regexp).slice(1);
};

/**
 * 通过构建 path，captures 的对应关系，产生一个便捷的 params 对象
 * captures 的值已经按照正则分组进行排序了
 * this.paramNames 和 captures 也是按照同样的正则产生的配置数组
 * 两者的出现顺序是一一对应的
 */
Layer.prototype.params = function (path, captures, existingParams) {
  const params = existingParams || {};

  for (let i = 0; i < captures.length; i++) {
    if (this.paramNames[i]) {
      const name = this.paramNames[i].name;
      const value = captures[i];
      params[name] = value ? safeDecodeURIComponent(value) : value;
    }
  }

  return params;
};

Layer.prototype.setPrefix = function (prefix) {
  if (this.path) {
    this.path = prefix + this.path;
    this.paramNames = [];
    this.regexp = pathToRegExp(this.path, this.paramNames, this.opts);
  }

  return this;
};

// 参数转码
function safeDecodeURIComponent(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
}

module.exports = Layer;
