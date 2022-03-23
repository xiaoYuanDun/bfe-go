/**
 * 这里其实是定义 context 的原型对象，我们在创建服务是，初始化 context 也是通过原型继承的方法继承这个对象
 * 作用应该是定义一些公共的方法
 */
const context__proto__ = {
  // body 的访问器和修改器
  get body() {
    return this._body;
  },
  set body(val) {
    const original = this._body;
    this._body = val;
  },

  // other ...
};

module.exports = context__proto__;
