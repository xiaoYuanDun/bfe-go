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
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null); // 向 MessageChannel 另一端发送消息，会把另一端注册的 onmessage 回调推入宏任务队列，并且没有 4ms 的最小限制
  };
} else {
  // 3. 非浏览器环境
  // TODO
}

// 所有回调任务都存在这个小顶堆中
var taskQueue = [];

// 当前被调度到的任务
let scheduledHostCallback = null;

// 可用于执行任务的最大时间的截止时间
// 每次 performWorkUntilDeadline 都会重设 deadline，表示一段可用时间的边界
let deadline = 0;

// ---------------------------- 初始化逻辑，全局变量 ----------------------------

/**
 * 为一个回调函数生成对应的执行任务，并进入优先队列排队，等待在未来某个时间被调度执行
 */
function scheduleCallback(callback) {
  var currentTime = getCurrentTime();

  // 为每一个回调，生成一个对应的任务对象
  const task = {
    callback,
  };

  // 入队列
  taskQueue.push(callback);

  // requestHostCallback 的参数不是具体的回调任务，而是一个 '开启工作循环的任务'
  requestHostCallback(flushWork);
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
  scheduledHostCallback = callback;
  schedulePerformWorkUntilDeadline(); // requestHostCallback 每次被调用会导致一个宏任务被推入队列
}

function performWorkUntilDeadline() {
  if (!scheduledHostCallback) {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval; // 每一次空闲时间开始时，都会设置一个到期时间
    // 当前任务是否还需要在下一轮调度中继续执行（没有执行完）
    let hasMoreWork = true;
    hasMoreWork = scheduledHostCallback();
    //     if (hasMoreWork) {
    //       // If there's more work, schedule the next message event at the end
    //       // of the preceding one.
    //       schedulePerformWorkUntilDeadline();
    //     } else {
    //       scheduledHostCallback = null;
    //     }
  } else {
    // TODO
  }
}

/**
 * 启动真正的工作循环
 */
function flushWork() {
  return workLoop();
}

function workLoop() {}

function shouldYield() {
  // TODO, 不完善
  return getCurrentTime() >= deadline;
}

export { scheduleCallback, shouldYield };
