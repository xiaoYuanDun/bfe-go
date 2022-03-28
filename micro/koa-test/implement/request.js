const parse = require('parseurl');
const { format } = require('url');
/**
 * 这里和 context 一样，也是构建一个通用的原型对象
 */
const request__proto__ = {
  // getter/setter -------------------------------------------------------------

  /**
   * 得到当前请求的 pathname
   */
  get path() {
    return parse(this.req).pathname;
  },
  set path(path) {
    // parseurl 库针对同一个 req 对象，会直接提取缓存，不进行多余的解析
    const url = parse(this.req);
    if (url.pathname === path) return;

    // todo, 两者有何区别, 为何要把 path 置为 null
    url.pathname = path;
    url.path = null;

    this.url = format(url);
  },

  get url() {
    return this.req.url;
  },
  set url(val) {
    this.req.url = val;
  },

  get method() {
    return this.req.method;
  },
  set method(val) {
    this.req.method = val;
  },
};

module.exports = request__proto__;
