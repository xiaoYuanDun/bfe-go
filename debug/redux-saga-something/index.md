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

### 调用链

从 run 开始到生成器执行:
`sagaMiddleware.run` --> `runSaga` --> `proc` --> `next`

生成器内部:
`next` --> `digestEffect` --> `runEffect (决定如何进行下一步)` ------> 下一个循环 ------> ...... ------> 结束 or 抛错

个人理解, 有以下几大核心域:

1. middleware.run 维护的生成器上下文 --> 处理每个 yield 的不同 effect
2. channel 维护的订阅列表和对外暴露的方法
3. 加工过的 dispatch, 中间件
4. 原生的 reducer

基本上, saga 就是围绕这几个域, 进行一系列的状态变化, 流程控制

一般情况下, 初始化中间件完毕后, 副作用上下文(**1**)已经准备就绪了, 之后用户或者程序在通过 '经过中间件包装的 dispatch(**3**)' 派发一个 action,
saga 捕获到 action, 经由 channel(**2**) 和 副作用上下文(**1**) 产生关联, 根据情况更新 channel(**2**)订阅列表, 最后, 副作用(特定表示的 Action)/原生 Action 到达 副作用上下文(**1**), 由其决定调用 rootSaga or reducer(**4**) 相关逻辑

除了基础的 take, put 等副作用, 还有 takeEvery, takeLasest 等高级副作用, 本质上都是对基础副作用的包装, 加入了一些额外的控制逻辑而已

### saga 的各种 effects

saga 提供的 effect 生产函数和 middleware 处理逻辑是成对作用的, 每个 effect 都会包装成特定格式的 `plain js object`, 由中间件统一识别和处理, 同时, 由于所有流程控制逻辑都是被分离到 rootSaga, 所以做单元测试时, 可以只关注流程本身(单独调试生成器函数), 这是 saga 相较于其他中间件实现异步流程控制的优势之处

#### take

`take` 会阻塞 rootSaga, 并且只会监听一次特定的 action 派发, 看下 take 的用法: `yield take('XX_ACTION')`, 实际上, take 函数会包装并返回一个特定类型的 ACTION -> `{ type: effectTypes.TAKE }`, 除了使用 type 区分, saga 还会在生成 ACTION 的时候添加不同的 symbol(如, take, put 都属于 symbol.IO),

#### put

`put` 不会阻塞 rootSaga, 一般会用来派发一个原生 Action 对象, put 函数会包装并返回一个特定的 ACTION -> `{ type: effectTypes.PUT, pyaload: { action } }`, 处理逻辑遇到 type 为 `effectTypes.PUT` 的 Action 时, 会调用原生 dispatch 方法派发一个原始 Action, 并继续执行下一个 yield 逻辑(非阻塞)

#### fork

`fork` 不会阻塞,

### TODO

#### call

#### apply

#### cps

#### actionChannel 同一个时间多个 action 被派发, 当一个副作用导致 saga 阻塞时, 其余 action 会被缓存在 actionChannel 里

#### eventChannel

#### 组合 saga

如果 rootSaga 中含有值 saga, 那么子 saga 内所有值决议后, 该子 saga 才算决议, rootSaga 才会继续向下执行

fork 的作用在表现形式上和 promise 有点像, fork 一个子 saga 或者 effect 后, 他会立即执行, 且不会阻塞当前 saga(有可能是 rootSata, 也有可能是 childSaga), 但是 fork 后的表达式是否决议, 影响着当前 saga 是否可以决议,

<!-- #### takeEvery

`takeEvery` 可以理解为一个无限循环的 `take` -->
