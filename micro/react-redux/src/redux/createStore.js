
/**
 * 
 * @param {*} reducer 处理器 
 * @param {*} initialState 初始值
 */
export default function createStore(reducer, initialState) {
    let state = initialState
    let listeners = []
    function getState() {
        return state
    }
    function dispatch(action) {
        let newState = reducer(state, action)
        state = newState
        listeners.forEach((i) => i())
        return action
    }
    function subscribe(listen) {
        listeners.push(listen)
        return () => {
            listeners = listeners.filter((i) => i !== listen)
        }
    }
    // 初始化时，会调用一次，防止state没有值
    dispatch({
        type: '@@REDUXINIT'
    })

    return {
        getState, // 用来获取当前仓库的状态
        dispatch, // 向仓库派发动作
        subscribe // 用来订阅仓库中的状态变化
    }
}