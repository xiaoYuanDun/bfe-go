import * as effectTypes from './effectTypes'

export function take(actionType) {
    return {
        type: effectTypes.TAKE,
        actionType
    }
}

export function put(action) {
    return {
        type: effectTypes.PUT,
        action
    }
}

export function select(selector) {
    return {
        type: effectTypes.SELECT,
        selector
    }
}

// 等于新开一个runSaga，执行里面的saga
export function fork(saga) {
    return {
        type: effectTypes.FORK,
        saga
    }
}

// 进行while循环，可以永远执行
export function takeEvery(pattern, saga) {
    function* takeEveryHelper() {
        while (true) {
            yield take(pattern)
            yield fork(saga)
        }
    }
    return fork(takeEveryHelper)
}

// call专门用于返回一个promise的情况
export function call(fn, ...args) {
    return {
        type: effectTypes.CALL,
        fn,
        args
    }
}

// cps专门用于callback的情况，不是promise的情况
export function cps(fn, ...args) {
    return {
        type: effectTypes.CPS,
        fn,
        args
    }
}

// all 所有任务执行完再执行下面的
export function all(effects) {
    return {
        type: effectTypes.ALL,
        effects
    }
}

// 取消任务执行
export function cancel(task) {
    return {
        type: effectTypes.CANCEL,
        task
    }
}

// delay函数
function delayP(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const delay = call.bind(null, delayP)