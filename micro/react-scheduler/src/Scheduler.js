import { push, pop, peek } from './SchedulerMinHeap';
import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from './SchedulerPriorities';

// ---------------------------- 初始化逻辑，全局变量 ----------------------------

/**
 * 获取当前时间的方法，根据宿主环境的兼容情况，可能会有以下不同实现
 */
let getCurrentTime;

if (typeof performance === 'object' && typeof performance.now === 'function') {
  // 1. 如果是浏览器环境，并且该浏览器环境支持 performance，这直接使用它
  const localPerformance = performance;
  getCurrentTime = () => localPerformance.now();
} else {
  // 2. 否则设置一个当前时间作为基准值，之后都是用调用 getCurrentTime 的时间减去这个基准值
  const localDate = Date;
  const initialTime = localDate.now();
  getCurrentTime = () => localDate.now() - initialTime;
}

/**
 * 调度 PerformWorkUntilDeadline 任务，根据宿主环境可能会有以下几种实现
 */
let schedulePerformWorkUntilDeadline;

if (typeof localSetImmediate === 'function') {
  // 1. Node.js and old IE
  // TODO
} else if (typeof MessageChannel !== 'undefined') {
  // 2. DOM and Worker environments, 一般我们都是在这个环境下（浏览器环境）
  // 这里解释了为什么使用 MessageChannel 而非 setTimeout
  // We prefer MessageChannel because of the 4ms setTimeout clamping.
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  // 向 MessageChannel 另一端发送消息，会把另一端注册的 onmessage 回调推入宏任务队列，并且没有 4ms 的最小限制
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  // 3. 非浏览器环境
  // TODO
}

// 所有回调任务都存在这个小顶堆中
const taskQueue = [];

// 任务计数器，用于维护优先队列的排队顺序
var taskIdCounter = 0;

// 当前正在执行的任务
let currentTask = null;

// 当前被调度到的任务，相当于一个锁
let scheduledHostCallback = null;
// TODO，个人感觉这两个锁的作用有点重复，可以用一个变量替代
let isMessageLoopRunning = false;

// 当前是否有 HostCallback 已经处于调度中了
let isHostCallbackScheduled = false;

// 是否有任务循环正在被执行
var isPerformingWork = false;

// 可用于执行任务的最大时间的截止时间
// 每次 performWorkUntilDeadline 都会重设 deadline，表示一段可用时间的边界
let deadline = 0;

// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.
let yieldInterval = 5;

// 31位2进制数，可以表示的最大的数
// maxN = Math.pow(2, N - 1) - 1  --->   Math.pow(2, 30) - 1
const maxSigned31BitInt = 1073741823;

/**
 * 不同的优先级的任务，对应的过期时间
 * IMMEDIATE_PRIORITY_TIMEOUT 优先级最高，立即过期
 * USER_BLOCKING_PRIORITY_TIMEOUT, NORMAL_PRIORITY_TIMEOUT, LOW_PRIORITY_TIMEOUT 在不同时间内过期
 * IDLE_PRIORITY_TIMEOUT 用不过期
 */
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

// ---------------------------- 初始化逻辑，全局变量 ----------------------------

/**
 * 为一个回调函数生成对应的执行任务，并进入优先队列排队，等待在未来某个时间被调度执行
 */
function scheduleCallback(priorityLevel, callback) {
  let startTime = getCurrentTime();

  // 根据 priorityLevel，给每个任务设置对应的 timeout，最终会和 startTime 相加为最终的过期时间
  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  const expirationTime = startTime + timeout;

  // 为每一个回调，生成一个对应的任务对象
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    // expirationTime 是 taskQueue 入队列是判断优先级的重要属性，expirationTime 越小优先级越高，在队列中越靠前，越早执行
    sortIndex: expirationTime,
  };

  // 入队列
  push(taskQueue, newTask);

  // isHostCallbackScheduled
  // 如果有一个还未执行的调度任务，就复用，不需要重新调度一次
  // 这里相当于一个锁，只要这个调度任务未执行，就可以一直复用，我们只需要添加 newTask，而不用起新的调度任务
  // isPerformingWork
  // 同时，如果有正在进行的工作，我们也不必起新的调度，只需要添加 newTask 到 taskQueue 即可
  // 因为，正在工作的循环逻辑也会检查并清空 taskQueue
  //
  // 这里注意，每个工作循环都会尽量处理完所有的 taskQueue 里的任务，如果因为时间分片不够而被迫退出
  // 那工作循环的逻辑内，会自己起一个调度任务，再下一个时间片里处理剩余任务，这就是上面两个变量可以复用调度任务的原因
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;

    // flushWork 不是具体的回调任务，而是一个 '开启工作循环的任务'
    requestHostCallback(flushWork);
  }

  return newTask;
}

/**
 * 开始调度 performWorkUntilDeadline
 * 实现上是通过 MessageChannel 向宏任务队列中推入 performWorkUntilDeadline
 * 在 react 下一次获得执行权时，会被调用
 *
 * 关于 react 的执行权，这里假设设备帧率为 60HZ，这一帧的时间大约为 16.6ms
 * js 执行各种内置方法，重渲染等会用去大概 10ms
 * 所以一帧中大约有 5ms 的空闲时间让用户去执行脚本（react 获得执行权），此时间非绝对，和帧率有直接关系
 */
function requestHostCallback(callback) {
  // 这里的 scheduledHostCallback 的意义我一直不是很明确
  // 因为可以直接调用 flushWork，为什么要用 scheduledHostCallback 传递一下呢
  scheduledHostCallback = callback;

  // 每次被调用会导致一个 performWorkUntilDeadline 宏任务被推入队列
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();

    // 每一轮宏任务得到执行时，都会设置一个此任务的到期时间
    deadline = currentTime + yieldInterval;

    // 当前任务是否还需要在下一轮调度中继续执行（没有执行完）
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback();
    } finally {
      if (hasMoreWork) {
        // 工作还没有完成，继续生成一个调度宏任务
        schedulePerformWorkUntilDeadline();
      } else {
        scheduledHostCallback = null;
        isMessageLoopRunning = false;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
}

/**
 * 开始启动工作循环，在分到的时间片内循环的执行任务
 */
function flushWork() {
  // 调度任务被执行，之后如果有新的任务，就可以正常发起新的调度任务了
  isHostCallbackScheduled = false;

  // 标记开始执行任务循环
  isPerformingWork = true;

  try {
    return workLoop();
  } finally {
    isPerformingWork = false;
  }
}

/**
 *
 * 工作循环，执行的逻辑依据
 *
 * - 如果 taskQueue 不为空，取出任务
 *   - 如果时间片用尽，且当前任务还没有过期，退出
 *   - 如果时间片用尽，但当前任务已经过去，继续执行（过期的任务一定要执行，不能等到下一次循环，即使可能造成浏览器卡顿）
 *
 */
function workLoop() {
  const currentTime = getCurrentTime();
  currentTask = peek(taskQueue);

  while (currentTask !== null) {
    // 循环过程中也要判断是否过期，同时要兼顾任务过期时间
    // console.log('currentTask.expirationTime', currentTask.expirationTime);
    // console.log('currentTime', currentTime);

    if (currentTask.expirationTime > currentTime && shouldYield()) {
      // if (shouldYield()) {
      break;
    }

    const callback = currentTask.callback;

    if (typeof callback === 'function') {
      currentTask.callback = null;

      // 可以把当前任务是否超时的信息，传递给回调，比如：react 的 performConcurrentWorkOnRoot 方法
      // 定义：function performConcurrentWorkOnRoot(root, didTimeout) { ... }
      // 使用：scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));
      const didTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didTimeout);

      // 由于我们回调形式是，如果没执行完，就返回它自身，所以这里表示该回调下次还要继续执行
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
      } else {
        // 当前任务已经执行完了，从队列中弹出
        if (currentTask === peek(taskQueue)) pop(taskQueue);
      }
    } else {
      pop(taskQueue);
    }

    // 继续取首个任务，开始下一轮的执行
    currentTask = peek(taskQueue);
  }

  // 表示这次退出是因为时间不足，还是全部执行完毕
  return currentTask !== null;
}

function shouldYield() {
  // TODO, 不完善
  return getCurrentTime() >= deadline;
}

export { scheduleCallback, shouldYield };
