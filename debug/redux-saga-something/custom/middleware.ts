import runSaga from './runSaga';
import { stdChannel } from './channel';
import { Action } from 'redux';

// saga 的发布订阅核心: channel
function sagaMiddlewareFactory({ channel = stdChannel() } = {}) {
  let boundRunSaga: Function | undefined;

  function middleware({ getState, dispatch }) {
    // redux.applymiddle 调用, 进行初始化
    boundRunSaga = runSaga.bind(null, { channel, dispatch });
    return (next) => (action: Action) => {
      /**
       * 这里说一下我的理解, 为什么不做验证就直接放行(调用 .next 继续下一个中间件)
       *
       * 因为 saga 会拦截指定的 Action, 如果此 Action 放行到下一个中间件,
       * 那么下一个中间件理论上并没有处理这个 Action 的 reducer, 所以放行并没有影响
       *
       * 如果当前 Action 本意不是要给 saga 处理, 那也没关系, saga 接收到 Action 后,
       * 发现 channel 中并没有对应这个 Action.type 的处理逻辑, 也不会有任何额外操作
       *
       * saga 与其他中间件的处理逻辑是相互独立的, 不会互相影响
       */

      console.log(action);
      const result = next(action); // hit reducers
      channel.put(action);
      return result;
    };
  }

  middleware.run = (...args: unknown[]) => {
    if (!boundRunSaga) {
      throw new Error('run 之前请先使用 applymiddle 进行初始化...');
    }
    return boundRunSaga(...args);
  };

  return middleware;
}

export default sagaMiddlewareFactory;
