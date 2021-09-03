/**
 *
 * proc 是真正处理 rootSaga 逻辑的地方, 如:
 * 返回 ACTION.TAKE 时要怎么处理
 * 返回 ACTION.PUT 时要怎么处理
 * yield 后又是一个生成器时, 要怎么处理
 * 等等, ......
 */

import { EnvType } from './runSaga';
import nextEffectId from './uid';
import { IO } from './symbols';
import effectRunnerMap from './effectRunnerMap';
import { AllTypeSharp } from './effects/effectTypes';

function proc(env: EnvType, iterator: Generator<any>, parentEffectId: number) {
  // finalizeRunEffect 默认是 v => v, 所以这里得到的 finalRunEffect 实际上就是 runEffect
  const finalRunEffect = env.finalizeRunEffect(runEffect);

  /**
   * saga 的核心依赖于 生成器, 而 next 方法就是调用每一次 yield 向下执行的关键
   * next 会一直调用直到所有的 yield 都被消费完, 或者手动 return/throws
   * 接受的参数:
   *    正常: (command | effect result, false)
   *    报错: (any thrown thing, true)
   */
  function next(args = undefined, isErr?: boolean) {
    let result;
    try {
      if (isErr) {
        // 如果出错, isErr 标识符为 true, 这时的 args 就是错误详情
        result = iterator.throw(args);
      } else {
        result = iterator.next(args);
      }

      // 是否消费完所有的 yield, 没有完就继续向下执行
      if (!result.done) {
        digestEffect(result.value, parentEffectId, next);
      } else {
        // TODO
      }
    } catch (e) {
      // TODO
    }
  }

  function digestEffect(effect: any, parentEffectId: number, cb: Function) {
    // 为这次任务打上自增标识
    const effectId = nextEffectId();

    function currCb(res?: unknown) {
      // 这个 cb 实际上就是 next 方法
      cb(res);
    }

    finalRunEffect(effect, effectId, currCb);
  }

  function runEffect(effect: any, effectId: number, currCb: Function) {
    // 属于副作用类型
    if (effect && effect[IO]) {
      const effectRunner = effectRunnerMap[effect.type as AllTypeSharp];
      effectRunner(env, effect.payload, currCb);
    }
  }

  // -----------------
  // ----- start -----
  // -----------------
  next();
}

export default proc;
