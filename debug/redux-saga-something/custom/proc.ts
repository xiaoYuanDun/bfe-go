/**
 *
 * proc 是真正处理 rootSaga 逻辑的地方, 如:
 * 返回 ACTION.TAKE 时要怎么处理
 * 返回 ACTION.PUT 时要怎么处理
 * yield 后又是一个生成器时, 要怎么处理
 * 等等, ......
 */

import { EnvType } from './runSaga';

function proc(env: EnvType, iterator: Generator) {
  /**
   * saga 的核心依赖于 生成器, 而 next 方法就是调用每一次 yield 向下执行的关键
   * next 会一直调用直到所有的 yield 都被消费完, 或者手动 return/throws
   * 接受的参数:
   *    正常: (command | effect result, false)
   *    报错: (any thrown thing, true)
   */
  function next(args: unknown) {
    const value = iterator.next();

    let result;

    try {
      result = iterator.next(args);

      if (!result.done) {
        digestEffect(result.value, parentEffectId, next);
      }
    } catch (e) {
      // TODO
    }
  }

  //
  function digestEffect() {}

  next();
}

export default proc;
