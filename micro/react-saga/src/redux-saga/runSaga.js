import * as effectTypes from './effectTypes'
// 执行迭代器
function runSaga(env, saga) {
    let { getState, dispatch, channel } = env
    // 有可能是迭代器的情况
    let it = typeof saga === 'function' ? saga() : saga
    function next(value, hasError) {
        let result = it.next(value)
        if (hasError) {
            result = it.throw(hasError)
        } else {
            const { done, value: effect } = result
            if (effect && typeof effect[Symbol.iterator] === 'function') {
                runSaga(env, effect)
                // 不阻止后续执行
                next()
            } else if (effect && typeof effect.then === 'function') {
                effect.then(next)
            } else {
                if (!done) {
                    switch (effect.type) {
                        case effectTypes.TAKE:
                            channel.once(effect.actionType, next)
                            break;
                        case effectTypes.PUT:
                            dispatch(effect.action)
                            next()
                            break;
                        case effectTypes.SELECT:
                            const state = effect.selector(getState())
                            next(state)
                            break
                        case effectTypes.FORK:
                            runSaga(env, effect.saga)
                            next()
                            break
                        case effectTypes.CALL:
                            effect.fn(...effect.args).then(next)
                            break
                        case effectTypes.CPS:
                            effect.fn(...effect.args, (err, data) => {
                                if (err) {
                                    next(err, true)
                                } else {
                                    next(data)
                                }
                            })
                            break
                        default:
                            break;
                    }
                }
            }
        }
    }
    next()
}

export default runSaga