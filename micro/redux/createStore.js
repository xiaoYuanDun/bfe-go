

export default function createStore (reducer, preloadedState, enhancer) {
   
  // todo,
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState  
    preloadedState = undefined
  }

	// 存在中间件，交给中间件去处理初始化逻辑
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(
      reducer,
      preloadedState 
    )  
  }

  let currentReducer = reducer
  let currentState = preloadedState 
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false

	// todo, 
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 返回最新的 state
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }
    return currentState  
  }

	// todo, nextListeners 与 currentListeners 的使用问题
	// 通过这里来注册监听函数（和对应的取消订阅函数）
  function subscribe(listener) {

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
			// 防止重复取消订阅
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

	// 数据更改的唯一触发方式，初始化时也用来创建原始 state 结构（dispatch(INIT_ACTION)）
	// 原始类型为 { type, payload }, 可使用中间件扩展类型，如 redux-thunk 的 promise 类型
  function dispatch(action) {
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

		// 触发我们注册的监听函数
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

 
	// 动态替换 reducer
  function replaceReducer (nextReducer) {

		currentReducer = nextReducer

		// 使用最新的 reducers 更新一下数据源结构，和 ACTION_INIT 功能相似
    dispatch({ type: ActionTypes.REPLACE })

    return store
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer: unknown) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          const observerAsObserver = observer as Observer<S>
          if (observerAsObserver.next) {
            observerAsObserver.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

	// 这里使用一个我们没注册的 ACTION，通过触发所有 reducers 查询并返回他们各自的初始值，来初始化 state
  dispatch({ type: ActionTypes.INIT })

  const store = ({
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  })

  return store
}
