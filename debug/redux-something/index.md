```js


/** 
 * 
 * createSubscription 生成一个订阅对象: subscription
 * 
 * subscription.listeners 初始值为一个空的占位对象: { notify() {}, get: () => [] }
 * 
 * 
 * /

```


```js

// createListenerCollection 最终会打到一个对象, 包含了一系列操作 listeners 的方法
// 且每个方法中都持有 listeners 的闭包引用

```


```js

// 解读一下 Provider 做的工作:

// Provider 首次调用 createSubscription 时, 仅仅传入了 store, 没有第二个参数
const subscription = createSubscription(store)

// subscription 的 onStateChange 属性默认不存在, 这里做一个赋值
subscription.onStateChange = subscription.notifyNestedSubs

```
