/**
 * saga 的核心管道体系, 可以理解为一个 发布/订阅模式的实现
 */

import { MULTICAST } from './symbols';

/**
 * multicastChannel 返回一个订阅列表, 和对这个订阅列表进行操作的各种方法, 如下:
 *   take: 订阅任务
 */
const multicastChannel = () => {
  // TODO
  // let closed = false;

  // 订阅列表
  const currentTakers: Function[] = [];

  let nextTakers = currentTakers;

  return {
    [MULTICAST]: true,
    take: (cb: Function) => {
      nextTakers.push(cb);
    },
  };
};

const stdChannel = () => {
  const chan = multicastChannel();

  return chan;
};

export { stdChannel };
