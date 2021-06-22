#### todo

- webpack require 模块缓存

- webpack 如何兼容 ES6 模块
  编译时，遇到 export import 会把他们进行处理，通过 defineProperty 给 module.exports 上添加 default 和具名导出，最终处理成 commonJS 形式，同时会给当前 exports 对象挂载一个 \_\_esModule: true 的属性 和 一个 Symbol.toStringTag
