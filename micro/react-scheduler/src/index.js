import { scheduleCallback, shouldYield } from './Scheduler';

// 这里的一个计算任务，可以理解为一次 react 更新，每次更新由多个 fiber 的更新组成

// 计算任务_0
let result = 0;
let i = 0;
function calculate() {
  const limit = 100000 * 10000;
  for (; i < limit && !shouldYield(); i++) {
    result += 1;
  }
  console.log('finish calc_0: ', i);

  // 更新还没完成，被中断了，下去需要继续执行
  if (i < limit) {
    return calculate;
  } else {
    return null;
  }
}

scheduleCallback(calculate);
