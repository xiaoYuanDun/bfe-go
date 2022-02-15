# `react-scheduler` 简单实现和学习

### 顺序的任务队列的实现

todo

### 带优先级的，可中断的任务队列

- 为了达到这个目的，引入小顶堆实现的优先队列 **`SchedulerMinHeap`**

- 定义优先级概念，如何比较不同任务的优先级 **`SchedulerPriorities`**

- 在生成每个任务时(scheduleCallback)，根据不同的 `priorityLevel`，设置不同的过期时间 `expirationTime`

  比如，在 `flushSyncCallbacks` 中，调用 `scheduleCallback` 就是 最高优先级`ImmediatePriority`，而在 `commitRootImpl` 中就是 `NormalPriority`

- 每个任务都会包含：创建时的时间(`startTime`)，过期时间(`expirationTime`)，任务优先级(`priorityLevel`) 等信息

# 几个问题

- 为什么不使用 `setTimeout`, `requestIdleCallback`, `requestAnimationFrame` [issue](https://github.com/facebook/react/issues/13206)

- react 何时使用 scheduleCallback 调度了一个延时任务，目前没有在源码中找到哪里有用到

- taskQueue 不为空时，如果这是有延时任务加入，这是逻辑并不会起一个 requestHostTimeout，那 timerQueue 又是什么时候被调度的呢

- shouldYield, didTimeout

- `unstable_runWithPriority` 何时使用

---

# 技术揭秘-问题点

- `taskQueue` 应该是 **已经被调度的任务**，而非已经过期的任务
