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

const localSetTimeout = typeof setTimeout === 'function' ? setTimeout : null;
const localClearTimeout =
  typeof clearTimeout === 'function' ? clearTimeout : null;

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
// 延时任务队列，同样也是小顶堆
const timerQueue = [];

// 任务计数器，用于维护优先队列的排队顺序
let taskIdCounter = 0;

// 当前正在执行的任务
let currentTask = null;

// 在途的延时任务的定时器
let taskTimeoutID = -1;

// 当前被调度到的任务，相当于一个锁
let scheduledHostCallback = null;
// TODO，个人感觉这两个锁的作用有点重复，可以用一个变量替代
let isMessageLoopRunning = false;

// 当前是否有 HostCallback 已经处于调度中了
let isHostCallbackScheduled = false;

// 作用和 isHostCallbackScheduled 非常相似，看成一个锁，可复用延时定时器
// 存在 延时定时器 期间，所有优先级比当前已启动定时器对应的延时任务低（即 startTime 更小)，都不必重新起一个定时器了（谓之'复用延时定时器'）
// 如果有优先级更高的延时任务（优先级越高，越早被推入 taskQueue），则取消当前定时器，并用最新 startTime 启动新的定时器
let isHostTimeoutScheduled = false;

// 是否有任务循环正在被执行
let isPerformingWork = false;

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
function scheduleCallback(priorityLevel, callback, options) {
  let currentTime = getCurrentTime();
  let startTime;

  // 为延时任务设置正确的 startTime
  // 注意延时任务的 startTime 的特点，一定大于当前的 currentTime
  // 普通任务的 startTime 和 currentTime 是相同的，会被实时的调度
  if (typeof options === 'object' && options !== null) {
    const { delay } = options;
    // delay 大于 0，才是一个有效的延时任务
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

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
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // 延时任务推入 timerQueue 后，不会被马上调用，他们在到达延时时间后，才有机会被推入真正的执行队列 taskQueue
    // 所以 timerQueue 是按照开始时间决定优先级的，先到达开始时间的，先被取出
    newTask.sortIndex = startTime;

    push(timerQueue, newTask);

    // 只有在普通任务队列全部执行完，并且当前最新的延时任务就是 timerQueue 中最高优先级的任务，这时，才会开始启动延时任务定时器
    // 那么就有一个问题：
    // 如果此时 taskQueue 不为空时，并且有一个延时任务加入，那么 timerQueue 会被加入一个延时任务，但是并不会执行下面的异步定时器调度逻辑
    // 那 react 怎么保证 timerQueue 被调度呢？
    // 答案是：在 workloop 每次执行完合法循环后（taskQueue 中全部符合要求的任务都被取出并执行，跳出内部 while循环）
    //         会检查是否 timerQueue 中最高优先级的任务状态，并决定要不要启动异步定时器（和 handleTimeout 内的逻辑相同）
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        // 这种情况说明，之前已经启动一个异步定时器，但是新的异步任务优先级更高，取消旧的异步定时器
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // 开始一个延时调度
      // startTime 表示期待在未来某个具体的时间开启，startTime - currentTime 则可以计算出从现在开始，需要延迟多久才能到达 startTime
      // 同一时间，只会存在一个在途的异步定时器 handleTimeout（优先级更高，清除旧的，启动新的；优先级更低，不会走到这里的逻辑，相当于复用）
      requestHostTimeout(handleTimeout, startTime - currentTime);
    } else {
    }
  } else {
    // 普通任务在下面会被马上推入 taskQueue，所以要按照 expirationTime 判断优先级
    // expirationTime 是 taskQueue 入队列是判断优先级的重要属性，expirationTime 越小优先级越高，在队列中越靠前，越早执行
    newTask.sortIndex = expirationTime;

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
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;

      // flushWork 不是具体的回调任务，而是一个 '开启工作循环的任务'
      requestHostCallback(flushWork);
    }
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

// 正常浏览器环境下，相当于使用 setTimeout 起一个定时器
function requestHostTimeout(callback, ms) {
  taskTimeoutID = localSetTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

function cancelHostTimeout() {
  localClearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();

    // 每一轮宏任务得到执行时，都会设置一个此任务的到期时间
    deadline = currentTime + yieldInterval;

    // TODO, 这个意义在哪里，已经用 const 声明了，又不能改变，
    // const hasTimeRemaining = true

    // 当前任务是否还需要在下一轮调度中继续执行（没有执行完）
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback(/* hasTimeRemaining */ currentTime);
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

function handleTimeout(currentTime) {
  // 释放锁
  isHostTimeoutScheduled = false;

  // 经过 advanceTimers 后，会把当前 timerQueue 中所有合法的 task 修改并按照对应的优先级推入 taskQueue
  // 所以 taskQueue 有可能会发生变化（增加或不变）
  advanceTimers(currentTime);

  // 这里可以看成是一个普通任务的调度逻辑（和 scheduleCallback 内的逻辑相同）
  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer = peek(timerQueue);
      // 如果当前的 timerQueue 不为空，说明内部还有没有到达延时时间的延时任务
      // 那么就按照队列中优先级最高的延时任务的 startTime 计算一个延时时间，并重新启动一个延时调度
      // 这样做，是为了保证在未来能够清空 timerQueue
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

// 这个方法调用频率比较高，在 workLoop 前后都会检查，每完成一个时间片也会检查，需要及时把 timerQueue 中准备好的 task 转移到 taskQueue
function advanceTimers(currentTime) {
  // 从 timerQueue 中循环取出合法任务，直到约到第一个不合法的 task 或者 timerQueue 为空，则退出当前工作循环
  let timer = peek(timerQueue);

  while (timer !== null) {
    if (timer.callback === null) {
      // 没有合法的 callback，可以判定为当前任务已经被取消了，直接从 timerQueue 中弹出对应 task 即可
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 已经经过了指定延时时间，可以被取出并推入执行队列 taskQueue 了
      pop(timerQueue);

      // 这里对 sortIndex 重新赋值，因为当前任务要被推入 taskQueue 了，而 taskQueue 优先级由 expirationTime 决定
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
      // TODO, remaining logic
    } else {
      // timerQueue 中优先级最高的 task 都没有到达定时延时时间，剩下的任务比当前 task 优先级更低，肯定也不可能达到延时时间，直接退出
      return;
    }
    timer = peek(timerQueue);
  }
}

/**
 * 开始启动工作循环，在分到的时间片内循环的执行任务
 */
function flushWork(initialTime) {
  // 调度任务被执行，之后如果有新的任务，就可以正常发起新的调度任务了
  isHostCallbackScheduled = false;

  // workLoop 在结束了 taskQueue 逻辑后，会判断 timer 是否为空，决定要不要以 timerQueue 中最高优先级的任务为基础，启动一个定时器
  // 如果这里不取消，会启动两个定时器任务（实际上只需要一个）
  // We scheduled a timeout but it's no longer needed. Cancel it.
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  // 标记开始执行任务循环
  isPerformingWork = true;

  try {
    return workLoop(initialTime);
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
function workLoop(initialTime) {
  const currentTime = initialTime;

  advanceTimers(currentTime);

  currentTask = peek(taskQueue);

  while (currentTask !== null) {
    // 循环过程中也要判断是否过期，同时要兼顾任务过期时间
    if (currentTask.expirationTime > currentTime && shouldYield()) {
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
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    // 继续取首个任务，开始下一轮的执行
    currentTask = peek(taskQueue);
  }

  // 表示这次退出是因为时间不足
  if (currentTask !== null) {
    return true;
  } else {
    // 检查 timerQueue，并判断是否需要启动延时任务定时器
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

function cancelTask(task) {
  // 由于 react 的小顶堆不支持从优先队列中删除指定项
  // 所以这里的取消并不是物理删除，而是把 task 的  callback 置为 null，并在工作循环执行 任务callback 是判断一下是否为 null
  task.callback = null;
}

function shouldYield() {
  // TODO, 不完善
  return getCurrentTime() >= deadline;
}

export { scheduleCallback, cancelTask, shouldYield };
