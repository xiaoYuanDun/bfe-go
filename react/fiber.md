### TODO

- fiber 是什么
- fiber 异步可中断的工作流程是怎样的
- 副作用连是什么
- reconcilerChildren 是什么
- 合成事件，16,17 有啥区别
- DIFF 算法，单节点/多节点
- 各种中间件的实现，redux，koa
- monoRepos to npm7.workspace
- setState 各种情况 同步模式, 异步模式, setTimeout 下，同异步
- 搞清楚一个 fiber 关联的各种对象，属性，全局变量
- bind

##### [stack-reconciler 官方解读](https://zh-hans.reactjs.org/docs/implementation-notes.html)

### `setState` 的调用流程与相关问题

##### `Component` 在原型上实现了 `setState` 方法, 内部调用的是 `updater.enqueueSetState`, 会在 `updater` 队列里构建并添加一个 `update`, 这里暂时只需要知道 `updater` 是一个记录当前节点更新内容的数据结构即可

##### `enqueueSetState` 会先通过当前节点的实例(如 Count 组件的实例就是 new Count())获取对应的 `fiber`

setState
-- enqueueSetState
-- -- // 构建 update 对象
-- -- enqueueUpdate 使用 update 对象构建循环链表, updateQueue
-- -- scheduleUpdateOnFiber
-- -- -- checkForNestedUpdates 检查是否存在循环更新的情况
-- -- -- markUpdateLaneFromFiberToRoot 向上循环找到 rootFiber, 还会对遍历到的 fiber 进行修改 lane 的操作, 暂时没看懂
-- -- -- markRootUpdated ???
-- -- -- ensureRootIsScheduled
-- -- -- -- scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root)) // performSyncWorkOnRoot 是调度关键方法, 这里有可能会复用上一个 task, 直接 return
-- -- -- -- -- scheduleSyncCallback 把 performSyncWorkOnRoot 放在 syncQueue 数组中
-- -- -- -- scheduleMicrotask // flushSyncCallbacks
-- -- -- flushSyncCallbacksOnlyInLegacyMode // 如果不是 batchUpdate 上下文, 则直接触发这次更新
-- -- -- -- flushSyncCallbacks 内部调用的 flush 方法和异步环境的一致

之后会从 syncQueue 取出每一个 fnc 并执行(这里是 performSyncWorkOnRoot)

每个 fiber 都有一个 updateQueue, 会在 fiber 初始化时调用 initializeUpdateQueue 生成

### render 过程

-- render
-- -- legacyRenderSubtreeIntoContainer
