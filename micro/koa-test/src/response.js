const Stream = require('stream');
const statuses = require('statuses');
const getType = require('cache-content-type'); // 通过简洁类型得到完整的 mime type 信息
const onFinish = require('on-finished'); // 在一次 http 请求结束之后执行回调
const destroy = require('destroy');

/**
 * 这里和 context 一样，也是构建一个通用的原型对象
 */
const response__proto__ = {
  /**
   * 这里在每次请求流程中生成的 response_once 中维护一个 body
   * 在最终处理响应体时，会取出这个 _body，并使用 原始res 相关方法来处理
   */
  get body() {
    return this._body;
  },
  set body(val) {
    const original = this._body;
    this._body = val;

    // 手动设置 body 为空值时，走这里的逻辑
    if (val === null || val === undefined) {
      // 如果状态码不为空响应体，则给一个空标识，因为不为空响应体时，body 必须有值，
      // 即使用户设置为 null，非 204，205，304 的响应体也必须有 body
      if (!statuses.empty[this.status]) {
        if (this.type === 'application/json') {
          this._body = 'null';
          return;
        }
        // todo，这里的意思是？
        this.status = 204;
      }
      if (val === null) this._explicitNullBody = true;

      // body 为空时不需要这些头信息
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // 如果没有手动设置过 statusCode，则在这里自动设置为 200
    if (!this._explicitStatus) this.status = 200;

    // 是否已经设置过 Content-Type 头
    const setType = !this.has('Content-Type');

    // 下面是针对各种不同类型的响应体进行的不同处理
    if (typeof val === 'string') {
      // todo, 这个正则不是很明白
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    if (val instanceof Stream) {
      // 保证在本次请求结束后销毁这个流
      onFinish(this.res, destroy.bind(null, val));

      if (original !== val) {
        // val.once('error', (err) => this.ctx.onerror(err)); // 可读流在读取中，若出错，调动一次 onerror
        if (original != null) this.remove('Content-Length'); // 如果 body 在此之前被设置过值，则在这里清除可能的 Content-Length
      }

      if (setType) this.type = 'bin';
      return;
    }
  },

  /**
   * 响应状态码
   */
  get status() {
    // 这里拿到的原始 res 的方法
    return this.res.statusCode;
  },
  set status(code) {
    if (this.headerSent) return;

    // 校验 statueCode 合法性
    // assert(Number.isInteger(code), 'status code must be a number');
    // assert(code >= 100 && code <= 999, `invalid status code: ${code}`);

    // 此属性是一个标识符，如果明确设置过状态码就标为 true，之后如果再设置 body 就不会自动添加状态码了
    // 如果此标识不为 true，说明用户没有手动设置过状态码，在之后设置 body 时，会自动添加 200
    this._explicitStatus = true;
    this.res.statusCode = code;
    console.log(statuses[code]);
    if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses(code);
    if (this.body && statuses.empty[code]) this.body = null;
  },

  /**
   * 得到响应体的 mime type，忽略后面的参数，如 Content-Type: text/html; charset=UTF-8 中 ';' 后面的 charset 参数会被忽略
   */
  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';', 1)[0];
  },
  set type(type) {
    type = getType(type);
    // 如果是个合法 type 则进行赋值，否则删除 Content-Type 头
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  },

  /**
   * 设置/获取 Content-Length 头信息
   */
  get length() {
    if (this.has('Content-Length')) {
      return parseInt(this.get('Content-Length'), 10) || 0;
    }
  },
  set length(n) {
    this.set('Content-Length', n);
  },

  // getter --------------------------------------------------------------------

  /**
   * 检查是否有 http 头被写入 socket
   * 这里也是从 原始res 上拿 headersSent
   */
  get headerSent() {
    return this.res.headersSent;
  },

  /**
   * 获取 response 对象的 header 信息，是 response.header 的别名
   */
  get headers() {
    return this.header;
  },

  get header() {
    const { res } = this;
    return typeof res.getHeader === 'function'
      ? res.getHeader()
      : res._headers || {};
  },

  // utils ---------------------------------------------------------------------

  /**
   * 设置 headers 信息，可以有多种形式来设置此信息
   *   this.set('Foo', ['bar', 'baz'])
   *   this.set('Accept', 'application/json')
   *   this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' })
   */
  set(field, val) {
    if (this.headerSent || !field) return;

    // K: V 形式
    if (arguments.length === 2) {
      if (Array.isArray(val)) {
        val = val.map((v) => (typeof v === 'string' ? v : String(v)));
      } else if (typeof val !== 'string') {
        val = String(val);
      }
      this.res.setHeader(field, val);
    } else {
      // hash 形式，遍历 key 并递归调用 this.set
      for (const key of field) {
        this.set(key, field[key]);
      }
    }
  },

  /**
   * 从 headers 中删除 key 为 field 的 header
   */
  remove(field) {
    if (this.headerSent) return;

    this.res.removeHeader(field);
  },

  /**
   * 判断 headers 中是否有 key 为 field 的 header
   */
  has(field) {
    return typeof this.res.hasHeader === 'function'
      ? this.res.hasHeader(field)
      : // Node < 7.7
        field.toLowerCase() in this.headers;
  },

  /**
   * 从 headers 中得到 key 为 field 的 header
   */
  get(field) {
    return this.res.getHeader(field);
  },
};

module.exports = response__proto__;
