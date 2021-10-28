# 手写 promise, 实现 A+ 规范

[https://promisesaplus.com/](promise/A+官方规范)


因为习惯函数式编程, 所以这里使用 function 而非 class 实现 Promise

### promise 的几个重要特征
1. Terminology
  1.1 `promise` 是一个拥有 `then` 方法对象或者函数
  1.2 一个对象或者函数如果定义了 `then` 方法, 我们称这些对象或者函数为 `thenable` 
  1.3 成功决议值 `value` 可以使任何合法的 js 值, 包括 undefined, thenable, promise 等
  1.4 异常 `exception` 是一个通过 throw 语法抛出的值
  1.5 失败决议值 `reason` 是一个用于描述当前 promise 为何失败的值

2. Requirements
  2.1 Requirements
  一个 promise 的状态一定是下面三个状态之一: `pending`, `fullfilled`, `rejected`
  2.1.1 当一个 promise 处于 `pending` 状态时:
    2.1.1.1 状态可以变为 `fullfilled` 活 `rejected`
  2.1.2 当一个 promise 处于 `fullfilled` 状态时:
    2.1.2.1 状态不可变更
    2.1.2.2 拥有一个不可变更的成功值 value
  2.1.2 当一个 promise 处于 `rejected` 状态时:
    2.1.2.1 状态不可变更
    2.1.2.2 拥有一个不可变更的失败原因 reason
 
  2.2 then 
  一个 promise 必须提供一个 then 方法用来处理其 决议值/异常
  一个 promise 的 `then` 方法, 接收两个参数: `promise.then(onFulfilled, onRejected)`
  2.2.1 `onFulfilled` 和 `onRejected` 都是可选参数
    2.2.1.1 如果 `onFulfilled` 不是函数, 那么忽略它
    2.2.1.2 如果 `onRejected` 不是函数, 那么忽略它
  2.2.2 如果 `onFulfilled` 是一个函数
    2.2.2.1 它必须在 promise 成功决议后(fullfilled)调用, 成功决议值 `value` 会作为它的第一个参数
    2.2.2.2 在 promise 成功决议前, 不可以调用它
    2.2.2.3 最多只能调用一次
  2.2.3 如果 `onRejected` 是一个函数
    2.2.3.1 它必须在 promise 失败决议后(rejected)调用, 失败决议值 `reason` 会作为它的第一个参数
    2.2.3.2 在 promise 失败决议前, 不可以调用它
    2.2.3.3 最多只能调用一次
  2.2.4 **重点内容: `onFulfilled` 和 `onRejected` 不可在当前调用栈中调用**(简单说, 就是不可同步调用, 需要把它们的调用加入异步队列)
  


  