import runSaga from './runSaga';
import { stdChannel } from './channel';

// saga 的发布订阅核心: channel
function sagaMiddlewareFactory({ channel = stdChannel() } = {}) {
  let boundRunSaga;

  function middleware({ getState, dispatch }) {
    // redux.applymiddle 调用, 进行初始化
    boundRunSaga = runSaga.bind(null, { channel });
    return (next) => (action) => {
      console.log('.....');
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
