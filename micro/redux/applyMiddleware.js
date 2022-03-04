
// 关注一下中间件的固定格式
// Middleware written as ES5 functions

// Outer function
// 这里的 storeAPI 就是原始 store 提供的方法
function exampleMiddleware(storeAPI) {
  return function wrapDispatch(next) {
    return function handleAction(action) {
      // Do anything here: pass the action onwards with next(action),
      // or restart the pipeline with storeAPI.dispatch(action)
      // Can also use storeAPI.getState() here

      return next(action)
    }
  }
}

// redux-thunk
const middleware = ({ dispatch, getState }) =>
  next =>
    action => {
      // The thunk middleware looks for any functions that were passed to `store.dispatch`.
      // If this "action" is really a function, call it and return the result.
      if (typeof action === 'function') {
        // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
        return action(dispatch, getState, extraArgument)
      }

      // Otherwise, pass the action down the middleware chain as usual
      return next(action)
    }

// 要使用中间件，需要按照官方提供的方式组织中间件关联
export default function applyMiddleware(middlewares) {

  // 这里返回值就是之前 createStore 中的参数：enhancer
  return (createStore) => (reducer, preloadedState) => {
    
    // 接管 store 创建工作，改造 dispatch
    const store = createStore(reducer, preloadedState)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    
    dispatch = compose<typeof dispatch>(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
