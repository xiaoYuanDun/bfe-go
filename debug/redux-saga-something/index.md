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

`fork` 不会阻塞

一个 saga 只有在以下情况才会执行完毕:

1. 使用终结指令结束自身执行(如 return, throws)
2. 它的所有 attached forks 都执行完毕(原文表达是 terminated, 和其行为更贴近)

因为它的行为和**并行 effect(任务并行执行; 父任务要等待所有子任务决议后才算完成)**很相似, 所有大部分情况下他们是可以互相变化的, 如:

```js
// 使用 fork
function* fetchAll() {
  const task1 = yield fork(fetchResource, 'users');
  const task2 = yield fork(fetchResource, 'comments');
  yield delay(1000);
}

// 使用 all
function* fetchAll() {
  yield all([
    call(fetchResource, 'users'), // task1
    call(fetchResource, 'comments'), // task2,
    delay(1000),
  ]);
}

function* main() {
  yield call(fetchAll);
}
```

注意, 因为 fork 也是一个副作用 effect, 所以它的处理逻辑也是被集成在 `effectRunnerMap` 中
每个独立的 saga 都会被执行一次 proc, 生成一个 task, 而每个 saga 的副作用处理都在 `digestEffect` 中开启, 每次调用 digestEffect, 都会对全局的任务 ID 做 ++ 操作,

看一下内部的 `runEffect(effect, effectId, currCb)` 方法:

```js
// .....
if (is.promise(effect)) {
  resolvePromise(effect, currCb);
} else if (is.iterator(effect)) {
  // 可以看到, 如果在这里开启一个 saga, 会使用递增之后的任务ID作为 parentEffectId
  // resolve iterator
  proc(env, effect, task.context, effectId, meta, /* isRoot */ false, currCb);
} else if (effect && effect[IO]) {
  const effectRunner = effectRunnerMap[effect.type];
  effectRunner(env, effect.payload, currCb, executingContext);
} else {
  // anything else returned as is
  currCb(effect);
}
```

#### takeEvery

可以理解为一个无限循环的 `take`, 首先 `takeEvery` 不会阻塞执行, 所有要先 fork 一个子任务, 保证非阻塞, 其次 `takeEvery` 可以监听每次特定 ACTION 的派发, 所以这里使用一个死循环, 在每次处理完一个任务后, 重新监听这个 ACTION

注意, 这里处理子任务的 effect 为什么也要用 fork 呢?
如果子任务是异步任务或者需要一定的执行时间, 再短时间内多次派发此 ACTION 的话, 第一个子任务处理期间的所有 ACTION 都不会被监听到, 因为使用 call 会阻塞执行, 阻塞期间并没有新的 ACTION 监听被添加到 channel 中(因为阻塞, 在本次执行完毕前, 不会到达下一次 take)

```js
function* rootSaga() {
  // yield takeEvery(ACTION_XXX, asyncGenerator);

  // takeEvery 的底层实现(实际并没有用到 ES6 原生生成器语法)
  yield fork(function* () {
    while (true) {
      yield take(ACTION_XXX);
      yield fork(asyncGenerator);
    }
  });
}
```

takeEvery 方法内部并没有使用 ES6 的 generator 语法, 而是通过实现 '迭代器协议', 自己构建了一个迭代器对象, 来模拟生成器的行为, 通过交替切换 `{ done: false, value: { type: TAKE }}`, `{ done: false, value: { type: FORK }}` 来实现永不停止的迭代器对象, 模拟 takeEvery 永远监听的效果

`takeEvery(XXX_ACTION, func)` 会 fork 一个辅助函数, 里面含有自定义迭代器对象, 因为 fork 之后的 task 会初始化子生成器, 继续向下调用执行(.next), 而自定义 .next 方法首先会返回 `{ done: false, value: { type: TAKE }}`, digestEffect 会把他加入 channel 中监听, 然后挂起, 让出执行权, 然后主流程执行完毕(如果主流程米有其他阻塞 effect 的话, 那么此时主流程就已经 **terminated** 了), 整个初始化阶段全部完毕

这时, 由用户或程序派发一个 ACTION, 被 saga 中间件捕获, 交给 channel 处理(`channel.put(action)`), 如果匹配到是 takers 里的监听函数, 就取消这个函数监听, 紧接着执行这个监听回调(被 TAKE 挂起的迭代器的 next 方法), 对应的迭代器对象恢复执行, 然后自定义 .next 方法返回 `{ done: false, value: { type: FORK }}`, 接着执行这个 forked-task 的生成器的内部逻辑(proc), 不管内部逻辑是什么都不会阻塞我们的自定义迭代器的执行逻辑(因为它是被 fork 出来的), 而且它内部的逻辑最终会是否会成功 terminated 都不会影响其他任务, 然后这个 forked-task 执行 cb 回调(自定义迭代器的 .next), 它接着返回 `{ done: false, value: { type: TAKE }}`, 从而使得 channel 重新订阅一次 XXX_ACTION, 然后又挂起, 让出执行权

就这样来回循环, 每次派发 ACTION 都会 fork 出一个新的 task, 他们之间不会互相影响

初始化:
takeEvery.next() --> channel.take(ACTION) --> 挂起, 等待 ACTION

ACTION 派发:
dispatch(ACTION) --> channel.put(ACTION) --> taker.cancel() --> takeEvery.next() --> channel.take(ACTION) --> 挂起, 等待 ACTION

#### takeLatest

和 `takeEvery` 类似, 也是非阻塞监听每一次派发, 但是区别是: 不会每次都走处理逻辑, 在子任务执行期间(有可能是异步任务)如果有新的派发, 则会取消上一次处理逻辑, 重新开始一个子任务, 始终保持执行最新的派发

#### cancel

一个 task 的 cancel, 最终是调用所属 queue 的 cancelAll 方法, 会遍历 queue 所有 task 并调用每个 task 的 cancel (嘿, 燃起来了, 开始递归了)

注意要使用 cancel, 需要要给 cancel 指定一个 task 参数, 表示需要被取消的任务, **取消** 完成后会继续在主流程中向下执行, 如果不指定 task, cancel.effect 会赋值一个 `SELF_CANCELLATION` 表示 需要取消当前 task 自己

`cancel` 过程中, 首先取消被指定的 task, 然后向下递归的取消其所有子 task

在调试 `cancel` 时, **cancellation 如何向下传递** 这里有点懵, 这里记录一下

首先明确一下, saga 主流程有 同步/异步 两种执行模式:

1. 同步执行时, 实际上是不需要 cancel 的, 因为执行到 cancel 这里时, 所有之前的任务都已经完成, 之后的任务还没有开始, 没有取消的意义
2. 着重说一下异步执行(也是 cancel 的重点使用场景), 我们通过 yield 生成一些 effect 时, 他们可能包含(fork 异步 task)或本身(delay)就是异步操作,
   当他们的异步任务正在进行时, 如果调用了 `yield cancel(task?)`, 那么 saga 是如何取消在途的任务的呢?

   有两个地方需要被取消: task(生成器主执行流程, 这里的**主流程**及指当前生成器的主流程, 不特指指根生成器) 和 effect(在途副作用)
   task 会使用 queue.cancelAll, 上面已经讨论过了
   effect 的取消函数(若需要, 比如 promise 就需要, put 就不需要), 会在每一次执行 runEffect 是挂载到 next 的 cancel 属性上, 注意, 生成器每次向下执行一步, 就会调用一次 runEffect, 而每次 runEffect 的执行, 都会根据当前 effect 的类型来更新 `next.cancel` 属性, 看看下面的代码:

```js
function* mySaga() {
  console.log('start ...');
  yield fork(function* () {
    yield delay(2000);
    console.log('after 2s');

    yield delay(3000);
    console.log('after 3s');
  });
  yield fork(function* () {
    yield delay(10000);
    console.log('after 10s');
  });

  yield take(CANCEL_ADD);
  yield cancel();
}
```

rootTask fork 了两个 子 task:

在 forked_01 中, 它对应的 task 只包含一个 queue: [mainTask], 而它的第一个副作用的取消函数会被挂载到它自己的 proc 的执行上下文的 next 上, 这是该任务挂起

在 forked_02 中, 它对应的 task 同样也只包含一个 queue: [mainTask], 它的副作用也一样, 被挂载到它的 next.cancel 上

这时 '取消操作' 可能会有四种情况(这里统一指取消根 saga 的 rootTask):

1. 如果 2s 前执行取消, 则有两个在途的 promise(forked_01 的 delay(2000), forked_02 的 delay(10000)), take 后面的 cancel 被激活后, 首先返回一个 cancelEffect 对象, 该对象被发往 runEffect, 最终进入 runCancelEffect, 从 rootTask 开始执行 cancel 操作, rootTask 的 mainTask 调用 `next(TASK_CANCEL)` 后, 生成器会得知需要终止自己的执行, 在调用 it.return() 的同时, 还会执行 next 方法上挂载的 cancel(有印象吗?在每次 runEffect 都会更新这个属性), 保证在途的 promise 可以被提前终止

2. 如果 2s 之后, 5s 之前执行取消, 则有两个在途的 promise(forked_01 的 delay(3000), forked_02 的 delay(10000)), 而且因为 delay(2000) 执行完毕后, forked_01 会继续向下执行一步, 会触发一次 runEffect, 更新 next.cancel 的值为 delay(3000) 的取消函数(看到了吗? 同一时间, 一个 task 的 next 方法上, 只会有一个 cancel 方法, 就是该 task 的在途 effect 对用的 cancel 方法), 这时 take 后的 cancel 被激活后, 和上面讲的一样, 都是先返回一个 cancelEffect 对象, ...(和上面一样)

3. 5s 后, 10s 前 执行取消, 只剩一个在途的 promise(forked_02 的 delay(10000)), forked_01 在执行完本身的逻辑后, 处于 **terminated** 状态, 从 rootTask 被删除, 这时 take 后的 cancel 被激活后, 和上面的也一样, 不赘述了

4. 10s 后, 没有在途的 effect, 执行取消不会进行任何有意义的操作

总结一下: saga 再运行时, 针对异步任务和子任务, 都会把他们的 **副作用取消函数** 挂载到自己的 next 方法上, 保证在自己或者父任务在执行取消时, 可以及时的取消在途的副作用, 这个 **副作用取消函数** 会在每次 .next 的时候被及时更新, 我们在取消任务时, 只需要关注 **当前 task 的在途 effect**即可, 因为一个 task 只能有一个在途的 effect, 如过有多个那就属于 fork 了, 属于另一个 task 的范围了。

对于一个 task 的 **完整 cancellation** 包括:

1. 结束自己的生成器执行流程
2. 取消在途的副作用

一个完整的 'cancellation' 会从指定的 task 开始, 递归的执行上述过程, 终结 目标 task 和他的所有 子 task

todo 自定义 delay 无法及时取消

#### delay

### TODO

#### call

#### apply

#### cps

#### actionChannel 同一个时间多个 action 被派发, 当一个副作用导致 saga 阻塞时, 其余 action 会被缓存在 actionChannel 里

#### eventChannel

#### 组合 saga

如果 rootSaga 中含有值 saga, 那么子 saga 内所有值决议后, 该子 saga 才算决议, rootSaga 才会继续向下执行

fork 的作用在表现形式上和 promise 有点像, fork 一个子 saga 或者 effect 后, 他会立即执行, 且不会阻塞当前 saga(有可能是 rootSata, 也有可能是 childSaga), 但是 fork 后的表达式是否决议, 影响着当前 saga 是否可以决议,

yield 支持 generator
