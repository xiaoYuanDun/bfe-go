
// 异步提交数据 检测action是否为函数，是则继续执行
export function reduxPromise({ getState, dispatch }) {
    return function (next) { // 调用下一个中间件 没有的话 next = dispatch方法
        return function (action) { // 这个就是改造后的dispatch
            // 有then和then是一个函数则当作是一个promise
            if (action.then && typeof action.then === 'function') {
                return action.then(dispatch).catch(dispatch)
            } else if (action.payload && action.payload.then && typeof action.payload.then === 'function') {
                return action.payload.then(payload => dispatch({ ...action, payload })).catch(error => {
                    dispatch({ ...action, error: true, payload: error })
                    return Promise.reject(error)
                })
            } else {
                return next(action)
            }
        }
    }
}