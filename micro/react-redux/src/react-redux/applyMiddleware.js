// 中间件格式固定
// 打印日志，进行异步处理，异步提交数据
export function logger({ getState, dispatch }) {
    return function (next) { // 调用下一个中间件 没有的话 next = dispatch方法
        return function (action) { // 这个就是改造后的dispatch
            console.log('prev state', getState())
            next(action)
            console.log('next state', getState())
        }
    }
}

// 调用 applyMiddleware(logger)(createStore)(rootReducer)返回的是一个store
export function applyMiddleware(middleware) {
    return function (createStore) {
        return function (reducer) {
            const store = createStore(reducer)
            const dispatch = middleware(store)(store.dispatch)
            return {
                ...store,
                dispatch
            }
        }
    }
}

export default applyMiddleware