import { compose } from '../redux'
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
// 单个中间件
// export function applyMiddleware(middleware) {
//     return function (createStore) {
//         return function (reducer) {
//             const store = createStore(reducer)
//             const dispatch = middleware(store)(store.dispatch)
//             return {
//                 ...store,
//                 dispatch
//             }
//         }
//     }
// }
// 多个中间件的情况
export function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer) {
            const store = createStore(reducer)
            // const dispatch = middleware(store)(store.dispatch)
            let dispatch;
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            }
            // 先将getState和改装的dispatch传进去
            const chain = middlewares.map((middleware) => middleware(middlewareAPI))
            const composeFn = compose(...chain) // 得到一个从右往左执行的函数
            dispatch = composeFn(store.dispatch) // 得到的是第一个中间件的dispatch
            return {
                ...store,
                dispatch
            }
        }
    }
}

export default applyMiddleware