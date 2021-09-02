/**
 * 真正的 run 方法
 * 第一个参数是在 redux.applymiddle 时通过 bind 绑定得到的, saga 就是我们自定义的 rootSaga
 */

import { immediately } from './scheduler';
import proc from './proc';
import { stdChannel } from './channel';

export type EnvType = {
  channel: unknown;
};

function runSaga(
  { channel = stdChannel() },
  saga: GeneratorFunction,
  ...args: unknown[]
) {
  const iterator = saga(...args);

  const env: EnvType = { channel };

  return immediately(() => {
    // const task = proc(iterator);
    const task = proc(env, iterator);
  });
}

export default runSaga;
