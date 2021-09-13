// 异步提交数据 检测是否为promise 是则在then里面传入dispatch
export function reduxThunk({ getState, dispatch }) {
    return function (next) { // 调用下一个中间件 没有的话 next = dispatch方法
        return function (action) { // 这个就是改造后的dispatch
            debugger
            if (typeof action === 'function') {
                return action(dispatch)
            } else {
                return next(action)
            }
        }
    }
}