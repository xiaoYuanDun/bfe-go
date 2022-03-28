const createError = require('http-errors');
const statuses = require('statuses');

const Delegator = require('./delegator');

/**
 * 这里其实是定义 context 的原型对象，我们在创建服务是，初始化 context 也是通过原型继承的方法继承这个对象
 * 作用应该是定义一些公共的方法
 */
const context__proto__ = {
  /**
   * 当我们在自定义逻辑的过程中，遇到一些错误，或者想主动跑出一些错误时，可以调用 throw 方法，它会创建一个异常，并向外层抛出
   */
  throw(...args) {
    throw createError(...args);
  },

  /**
   * 默认的全局错误处理器
   */
  onError(err) {
    // 没有错误，直接返回
    if (err === null || err === undefined) return;

    // 如果响应以发出，不做处理
    if (this.headerSent) return;

    // 需要把当前响应替换为一个报错响应，404，500这种
    const { res } = this;

    // 首先移除目前已有的所有 headers
    if (typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach((field) => res.removeHeader(field));
    } else {
      res._headers = {}; // Node < 7.7
    }

    // 同步一些 error 信息，这里的 err 一般是开发使用 throw 方法手动抛出的
    this.set(err.headers);

    // mime 类型强制变为 text/plain
    this.type = 'text';
    let statusCode = err.status || err.statusCode;

    // 如果是不合法状态码，默认给个 500，个人认为后面的判断条件没啥用，会导致所有的状态码都被置为 500，先注释掉
    if (typeof statusCode !== 'number' /* || !statuses(statusCode) */)
      statusCode = 500;

    // 构建报错响应，选择报错信息，选择正确的状态码，设置错误字符串长度等
    const code = statuses[statusCode];
    const msg = err.expose ? err.message : code;
    this.status = err.status = statusCode;
    this.length = Buffer.byteLength(msg);
    res.end(msg);
  },
};

module.exports = context__proto__;

// 通过委托模式建立 context 到 response 的联系
Delegator(context__proto__, 'response')
  .method('set')
  .access('body')
  .access('status')
  .access('length')
  .access('type')
  .getter('headerSent');

// 同理，把一些 request 上的属性委托到 context 上
Delegator(context__proto__, 'request').access('path').access('method');
