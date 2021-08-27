
function createObject(o) {
  function f() { }
  f.prototype = o.prototype
  return new f()
}

function prototype(child, parent) {
  let prototype = createObject(parent)
  prototype.constructor = child
  child.prototype = prototype
}

Function.prototype.bind2 = function (context) {
  const self = this // 指向的是function
  // const bindThis = arguments[0]
  const args = Array.prototype.slice.call(arguments, 1)
  const fnBind = function () {
    const fnArgs = Array.prototype.slice.call(arguments)
    // new 操作符时，obj.__proto__ = fnBind.prototype 所以instanceof会相等
    return self.apply(this instanceof fnBind ? this : context, args.concat(fnArgs))
  }
  // 使用空函数进行中转，防止返回的函数的prototype修改导致this被修改
  // this指的是调用bind的函数，将属性覆盖过来，用于构造函数
  const fn = function () { }
  fn.prototype = this.prototype
  fnBind.prototype = new fn();
  return fnBind
}

// var value = 2;

// var foo = {
//   value: 1
// };

// function bar(name, age) {
//   this.habit = 'shopping';
//   console.log(this.value);
//   console.log(name);
//   console.log(age);
//   return {
//     bbb: 1,
//     ccc: 2
//   }
// }

// bar.prototype.friend = 'kevin';
// var bindFoo = bar.bind2(foo, 'daisy');

// 当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，但传入的参数依然生效。
// var obj = new bindFoo('18');
// console.log(obj)
// console.log(obj.friend);
// console.log(obj.habit);


// 实现call的方法
Function.prototype.call2 = function (context) {
  var context = context || window
  context.fn = this
  // const argv = Array.prototype.slice.call(arguments, 1)
  const argv = []
  for (var i = 1; i < arguments.length; i++) {
    argv.push('arguments[' + i + ']')
  }

  const res = eval('context.fn(' + argv + ')')
  delete context.fn

  return res
}


// 实现apply方法
Function.prototype.apply2 = function (context, args) {
  var context = context || window
  context.fn = this
  let result
  if (!args) {
    result = context.fn()
  } else {
    const argv = []
    // 因为对象等不能直接转
    for (var i = 0; i < args.length; i++) {
      argv.push('args[' + i + ']')
    }
    result = eval('context.fn(' + argv + ')')
  }

  delete context.fn
  return result
}

var value = 2

const f = {
  value: 1
}

const fn = function (name, age) {
  console.log(this.value)
  console.log(name)
  console.log(age)
  return 4
}
console.log(fn.apply2(f, [2, { a: 1 }]))