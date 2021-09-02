## 实现自己的 redux-saga

还原过程中尽量和源码文件目录一致, 过程中会顾略一些错误验证, 边界值校验相关的代码

### redux-saga 是一个 redux 中间件

要编写一个中间件, 首要要遵循中间件的编写规则:

```ts
const middleware = ({ getState, dispatch }: middlewareAPI) => {
  return (next) => {
    return (action) => {
      // 自定义逻辑
      next(action);
      dispatch(action);
      // ...
    };
  };
};
```

使用 redux-saga 时, 需要通过工厂方法产出一个中间件, 所以这里应该是:

```ts
const sagaFactory = () => middleware;
```

同时, 初始化好的 saga-middleware 需要通过 `run` 方法启动, 所以他们必选有一个可调用的 `run` 属性, 参数是 rootSaga:

```ts
const sagaMiddleware = sagaFactory();
sagaMiddleware.run(rootSaga);
```

因为 redux-saga 是在生成器的基础上就行中间件处理的, 所以 rootSaga 是生成器形式, 并在 run 方法中被传入且启动生成器

### 基本结构

run 方法内部, 实际上调用的时 runSaga 方法, 他会在 redux.applymiddleware 时被 bind 在 run 上下文中, 并且在 run 调用时, 和传入的 rootSaga 一起被传入, 此方法的基本逻辑就就是:

1. 调用 rootSaga(generator), 生成 iterator(genertor 迭代器)
2. 把 iterator 传给 proc 方法, 这里是真正处理各种 effect 的地方

proc 方法内部, 定义了一个 next 方法, 这是控制 iterator 如何向下执行的关键函数, 他会针对不同的 effect 类型(take, put, yield generator)或其他情况进行不同的处理, 决定是否正常向下执行, 或者提前退出/抛出错误

我们接下来要进行的主要是在 proc 内部处理各种情况...

### channel

这里先说一下 `take` 这个 effect, 当 `yield take('XX_ACTION')` 时, take 函数会包装并返回一个特定类型的 ACTION -> `{ type: effectTypes.TAKE }`, 并且会导致这个 iterator 在此挂起, 一直到 dispatch 派发一个 `{ type: XX_ACTION }` 的 ACTION, iterator 会继续向下执行, 并且这个 `take` 的挂起效果只会生效一次, 那么 saga 是如何做到挂起和监听的呢?

saga 有一个管道的概念(channel), 其工作原理就是一个发布订阅的实现, 大概流程是, 在发现存在 `take` 时把控制向下执行的 `next` 方法推到监听任务队列中, iterator 挂起, 一直到对应的 ACTION 被捕获, 比较 ACTION 是否为监听任务队列中等待的, 若是, 调用队列任务, `next` 执行, iterator 继续向下执行

### saga 的各种 effects

`take` 会阻塞 rootSaga, 并且只会监听一次特定的 action 派发, 看下 take 的用法: `yield take('XX_ACTION')`, 实际上, take 函数会包装并返回一个特定类型的 ACTION -> `{ type: effectTypes.TAKE }`, 除了使用 type 区分, saga 还会在生成 ACTION 的时候添加不同的 symbol(如, take, put 都属于 symbol.IO),
