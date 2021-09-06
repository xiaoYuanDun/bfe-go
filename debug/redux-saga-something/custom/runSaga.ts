/**
 * 真正的 run 方法
 * 第一个参数是在 redux.applymiddle 时通过 bind 绑定得到的, saga 就是我们自定义的 rootSaga
 */

import { immediately } from './scheduler';
import proc from './proc';
import { stdChannel } from './channel';
import nextSagaId from './uid';
import { identity } from './utils';
import { MulticastChannel } from './channel';

export type EnvType = {
  channel: MulticastChannel;
  finalizeRunEffect: Function;
  dispatch: Function;
};

function runSaga(
  { channel = stdChannel(), dispatch }: any,
  saga: GeneratorFunction,
  ...args: unknown[]
) {
  const iterator = saga(...args);

  const effectId = nextSagaId();

  /**
   * finalizeRunEffect 函数在 env.effectMiddlewares 存在时会有其他操作, 这里暂时不去了解
   * 默认 identity 就是原样返回, 没有做任何操作
   */
  const finalizeRunEffect = identity;

  const env: EnvType = { channel, finalizeRunEffect, dispatch };

  return immediately(() => {
    const task = proc(env, iterator, effectId, true);
  });
}

export default runSaga;
