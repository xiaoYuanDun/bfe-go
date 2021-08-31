// import * as is from '@redux-saga/is'
// import { check, assignWithSymbols, createSetContextWarning } from './utils'
// import { stdChannel } from './channel'
// import { runSaga } from './runSaga'

export default function sagaMiddlewareFactory({
  context = {},
  channel = stdChannel(),
  sagaMonitor,
  ...options
} = {}) {
  let boundRunSaga;

  //   if (process.env.NODE_ENV !== 'production') {
  //     check(channel, is.channel, 'options.channel passed to the Saga middleware is not a channel')
  //   }

  // redux.applyMiddleware(middleware) 会把 saga 中间件挂载到 store 中
  // 这里的 dispatch, 应该是所有的中间件得到的 dispatch 都是进过加工的合成 dispatch
  function sagaMiddleware({ getState, dispatch }) {
    boundRunSaga = runSaga.bind(null, {
      ...options,
      context,
      channel,
      dispatch,
      getState,
      sagaMonitor,
    });

    return (next) => (action) => {
      // if (sagaMonitor && sagaMonitor.actionDispatched) {
      //   sagaMonitor.actionDispatched(action);
      // }
      const result = next(action); // hit reducers
      // channel.put(action);
      return result;
    };
  }

  sagaMiddleware.run = (...args) => {
    // redux.applyMiddleware 时会初始化 boundRunSaga
    // 这里的 args 就是 root-saga
    if (process.env.NODE_ENV !== 'production' && !boundRunSaga) {
      throw new Error(
        'Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware'
      );
    }
    return boundRunSaga(...args);
  };

  //   sagaMiddleware.setContext = props => {
  //     if (process.env.NODE_ENV !== 'production') {
  //       check(props, is.object, createSetContextWarning('sagaMiddleware', props))
  //     }

  //     assignWithSymbols(context, props)
  //   }

  return sagaMiddleware;
}
