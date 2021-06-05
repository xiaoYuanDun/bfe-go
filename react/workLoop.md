### 梳理一下整个运行流程

scheduleUpdateOnFiber, ensureRootIsScheduled 这两个方法都会调用 performSyncWorkOnRoot

-- scheduleUpdateOnFiber
-- -- performSyncWorkOnRoot

-- ensureRootIsScheduled
-- -- performSyncWorkOnRoot

以下方法会调用 `scheduleUpdateOnFiber`

```js
classComponentUpdater {
	enqueueSetState,
	enqueueReplaceState,
	enqueueForceUpdate
}
refreshCache
dispatchAction
updateDehydratedSuspenseComponent
scheduleFibersWithFamiliesRecursively
updateContainer
attemptSynchronousHydration$1
attemptDiscreteHydration$1
attemptContinuousHydration$1
attemptHydrationAtCurrentPriority$1
overrideHookState
overrideHookStateDeletePath
overrideHookStateRenamePath
overrideProps
overridePropsDeletePath
overridePropsRenamePath
scheduleUpdate
```

以下方法会调用 `ensureRootIsScheduled`

```js
scheduleUpdateOnFiber;
performConcurrentWorkOnRoot;
performSyncWorkOnRoot;
flushRoot;
commitRootImpl;
captureCommitPhaseErrorOnRoot;
captureCommitPhaseError;
pingSuspendedRoot;
retryTimedOutBoundary;
```

---

这两个方法是所有任务单元的起点：

`performConcurrentWorkOnRoot`
This is the entry point for every concurrent task, i.e. anything that

`performSyncWorkOnRoot`
This is the entry point for synchronous tasks that don't go through Scheduler

`performUnitOfWork` 用来开启调度任务

### 梳理一下 fiber 相关的属性，变量，全局变量

```ts
workInProgress; // 当前正在工作的 fiber

fiber: {
  alternate; //	当前 fiber 上一次渲染得到的旧 fiber
}
```

2 种任务执行类型：同步/异步；区别是：异步工作循环中，每次循环要检查是否超时(帧空闲时间不足，需要让出主线程)

```
performSyncWorkOnRoot --> renderRootSync --> workLoopSync --> performUnitOfWork
performConcurrentWorkOnRoot --> renderRootConcurrent --> workLoopConcurrent --> performUnitOfWork
```

```js
function workLoopSync() {
  // Already timed out, so perform work without checking if we need to yield.
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

`ReactDOM.render` 是整个 `react` 应用的起点

```js
/**
 * render
 *   legacyRenderSubtreeIntoContainer
 *
 */
```

首个 `workInProgress` 是什么时候构建的呢
