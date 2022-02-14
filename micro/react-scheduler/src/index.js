import { scheduleCallback, shouldYield, cancelTask } from './Scheduler';
import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from './SchedulerPriorities';

// 这里的一个计算任务，可以理解为一次 react 更新，每次更新由多个 fiber 的更新组成
// 这里的方法定义，是为了模拟 react 中的更新行为（通过 shouldYield 实现可中断）
// 可中断在这里的表现就是：如果没有执行完，就返回当前函数本身，下次可以继续执行
// 被调度的方法可以接受一个 didTimeout 参数，可以判断当前任务是不是已经到期了
//
// 加入了 didTime 后，打印结果有点变化，是因为如果已经超时，该任务会一直执行直到结束，而不是提前退出，
// 所以从 console 观察到的结果是超时后，一个任务时间片（虽然这个时间片已经超过预设值）内就完成了所有的工作
const calcFactory = (id, limit = 10000 * 100) => {
  let result = 0;
  let i = 0;
  const calculate = (didTimeout) => {
    console.log(`[计算任务${id}] - 开始, 是否超时：[${didTimeout}]`);
    for (; i < limit && (!shouldYield() || didTimeout); i++) {
      result += 1;
    }

    // 更新还没完成，被中断了，下去需要继续执行
    if (i < limit) {
      console.log(`[计算任务${id}] - 时间用尽, 进度: [${i}/${limit}]`);
      return calculate;
    } else {
      console.log(`[计算任务${id}] --- 全部完成 -----------------------------`);
      return null;
    }
  };
  return calculate;
};

console.log('start ...');

// case_0: 不同优先级的任务的协调
const func0 = calcFactory('0', 10);
// const func1 = calcFactory('1');
// const func2 = calcFactory('2');

scheduleCallback(UserBlockingPriority, func0);
// scheduleCallback(NormalPriority, func1);
// scheduleCallback(ImmediatePriority, func2);

// -----------------------------------------------------------------------------

// case_1: 延时任务的表现
// const func3 = calcFactory('3', 1000);
// const func4 = calcFactory('4', 1000);
// const func5 = calcFactory('5', 1000);
// const func6 = calcFactory('6', 1000);
// const func7 = calcFactory('7', 1000);

// // scheduleCallback(NormalPriority, func3, { delay: 10000 });
// // scheduleCallback(NormalPriority, func4, { delay: 5000 });
// // scheduleCallback(NormalPriority, func5, { delay: 6000 });
// scheduleCallback(NormalPriority, func6, { delay: 2000 });
// setTimeout(() => {
//   scheduleCallback(NormalPriority, func4);
// }, 1000);

// -----------------------------------------------------------------------------

// case_2: 取消任务的表现
// const func8 = calcFactory('8', 1);
// const func9 = calcFactory('9', 1);
// const t1 = scheduleCallback(NormalPriority, func8, { delay: 2000 });
// const t2 = scheduleCallback(NormalPriority, func9, { delay: 30000 });
// cancelTask(t2);
