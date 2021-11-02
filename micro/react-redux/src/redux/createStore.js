/**
 * 检测obj是否为纯函数
 * @param {*} obj 
 * @returns 
 */
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false
    }
    // 纯函数，继承的不算，所以不能使用instanceof
    return Object.getPrototypeOf(obj) === Object.prototype
}
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
        if (!isPlainObject(action)) {
            throw new Error('该action不是纯函数')
        }
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
// 立即执行，相当于执行了之后过wait秒才可以下一次执行
const debounce = function (fn, wait, immediate) {
    let timeout = null
    let result
    const debounced = function () {
        const context = this
        const args = arguments

        if (timeout) {
            clearTimeout(timeout)
        }

        if (immediate) {
            let callNow = !timeout
            timeout = setTimeout(() => {
                timeout = null // 重新设置为null
            }, wait)
            if (callNow) {
                result = fn.apply(context, args)
            }
        } else {
            timeout = setTimeout(() => {
                fn.apply(context, args)
            }, wait)
        }
        return result
    }


    debounce.cancel = () => {
        clearTimeout(timeout)
        timeout = null
    }
    return debounced
}

// 停止触发之后不能执行最后一次
function throttle(func, wait) {
    let previous = 0
    let context, args
    return function () {
        let now = +new Date()
        context = this
        args = arguments
        if (now - previous >= wait) {
            func.apply(context, args)
            previous = now
        }
    }
}

// 刚一进来不能立刻执行
function throttleTimer(func, wait) {
    let previous = 0
    let context, args
    let timeout;
    return function () {
        context = this
        args = arguments
        if (!timeout) {
            timeout = setTimeout(() => {
                func.apply(context, args)
                timeout = null
            }, wait)
        }
    }
}
// 两者结合
function throttleDouble(func, wait) {
    let args, context, result, timeout
    let previous = 0

    let later = function () {
        previous = +new Date()
        timeout = null
        func.apply(context, args)
    }

    const throttle = function () {
        let now = +new Date()
        context = this
        args = arguments
        let remain = wait - (now - previous)
        if (remain < 0 || remain > wait) {
            // 直接触发
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            func.apply(context, args)
            previous = now
        } else if (!timeout) {
            setTimeout(later, wait)
        }
    }

    return throttle
}