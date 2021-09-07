import { fork, take } from '../effects';
import fsmIterator, { safeName } from './fsmIterator';

/**
 *
 * 看一下下面的代码, 根saga结构如下:
 *
 *   yield fork(function* () {
 *     while(1) {
 *       yield take(ACTION_XXX);
 *       yield fork(asyncGenerator);
 *     }
 *   })
 *
 *   proc --> next --> ... result = iterator.next(args);
 *
 *     执行生成器过程时, 会通过调用 next 得到当前副作用包裹对象,
 *     如果是 fork(XXX) 且没有结束的话就是:
 *     {
 *       done: false,
 *       value: { type: FORK, //... }
 *     }
 *
 *     如果是 take(XXX) 且没有结束的话就是:
 *     {
 *       done: false,
 *       value: { type: TAKE, //... }
 *     }
 *
 *   那么我们是不是可以自己构建这些对象来模拟其行为呢?
 *
 */
const takeEvery = (patternOrChannel: any, worker: Function, ...args: any) => {
  // 构建一个尚未遍历结束的 TAKE
  const yTake = { done: false, value: take(patternOrChannel) };

  // 构建一个尚未遍历结束的 FORK
  const yFork = (ac: any) => ({
    done: false,
    value: fork(worker, ...args, ac),
  });

  let action: any;
  let setAction = (ac: any) => {
    action = ac;
  };

  // 得到一个 迭代器对象, 相当于调用 generator(), 这里的 takeEvery 整个会被当成一个 generator 来调用 (createTaskIterator)
  return fsmIterator(
    {
      q1() {
        return { nextState: 'q2', effect: yTake, stateUpdater: setAction };
      },
      q2() {
        return { nextState: 'q1', effect: yFork(action) };
      },
    },
    'q1',
    `takeEvery(${safeName(patternOrChannel)}, ${worker.name})`
  );
};

export default takeEvery;
