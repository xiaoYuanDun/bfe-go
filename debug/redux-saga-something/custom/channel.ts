/**
 * saga 的核心管道体系, 可以理解为一个 发布/订阅模式的实现
 */
import { Action } from 'redux';
import { MULTICAST, MATCH } from './symbols';
import * as matchers from './matcher';
import { once, remove } from './utils';

/**
 * multicastChannel 返回一个订阅列表, 和对这个订阅列表进行操作的各种方法, 如下:
 *   take: 订阅任务, 入列
 *   put: 对 Action 进行匹配校验,
 */
const multicastChannel = () => {
  // TODO
  // let closed = false;

  // 订阅列表
  let currentTakers: any[] = [];

  return {
    [MULTICAST]: true,

    take: (cb: any, matcher: Function | null) => {
      // cancel 内部调用 remove 从订阅列表中移除当前的订阅函数(taker)
      cb.cancel = once(() => {
        remove(currentTakers, cb);
      });

      cb[MATCH] = matcher;

      currentTakers.push(cb);
    },
    put: (action: Action) => {
      const takers = currentTakers;

      for (let i = 0, len = takers.length; i < len; i++) {
        const taker = takers[i];

        if (taker[MATCH](action)) {
          taker.cancel();
          taker(action);
        }
      }
    },
  };
};

const stdChannel = () => {
  const chan = multicastChannel();

  return chan;
};

export { stdChannel };

export type MulticastChannel = ReturnType<typeof multicastChannel>;
