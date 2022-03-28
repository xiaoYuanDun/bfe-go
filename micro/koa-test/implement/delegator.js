function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
}

// 如果以 'response' 委托给 obj, 则访问 obj.xxx 时访问的实际上是 obj.response.xxx
Delegator.prototype.method = function (name) {
  const proto = this.proto;
  const target = this.target;

  // 这里做的就是，给被委托对象上注册一个同名的函数调用，而实际上调用的是内部委托对象的方法
  proto[name] = function () {
    return this[target][name].apply(this[target], arguments);
  };

  // 返回 this，实现链式调用，注意这里的 this 是 Delegator 实例
  return this;
};

/**
 * 源码中在这里定义属性时用的是 __defineGetter__, __defineSetter__
 * 但是这对方法属于过时废弃方法，在自己实现时，尝试使用 defineProperty 来代替
 * 但是发现，在针对同一个属性分别进行 getter, setter 调用时，defineProperty 会调用两次
 * 这会导致 defineProperty 的重复报错（不能重复定义属性描述）
 *
 * 这该如何解决呢？
 * https://stackoverflow.com/questions/27400010/object-prototype-definegetter-and-definesetter-polyfill
 *
 */
Delegator.prototype.getter = function (name) {
  const proto = this.proto;
  const target = this.target;
  const newDescriptor = Object.assign(
    Object.getOwnPropertyDescriptor(proto, name) || {},
    {
      get: function () {
        return this[target][name];
      },
      configurable: true,
    }
  );

  Object.defineProperty(proto, name, newDescriptor);

  return this;
};

Delegator.prototype.setter = function (name) {
  const proto = this.proto;
  const target = this.target;
  const newDescriptor = Object.assign(
    Object.getOwnPropertyDescriptor(proto, name) || {},
    {
      set: function (val) {
        this[target][name] = val;
      },
      configurable: true,
    }
  );

  Object.defineProperty(proto, name, newDescriptor);

  return this;
};

Delegator.prototype.access = function (name) {
  return this.getter(name).setter(name);
};

module.exports = Delegator;
