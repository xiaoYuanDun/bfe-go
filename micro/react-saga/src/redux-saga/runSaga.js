import * as effectTypes from './effectTypes'
import { TASK_CANCEL } from './symbols'
// 执行迭代器
function runSaga(env, saga, callback) {
    let { getState, dispatch, channel } = env
    // 有可能是迭代器的情况
    let it = typeof saga === 'function' ? saga() : saga
    let task = { cancel: () => next(TASK_CANCEL) }
    function next(value, hasError) {
        let result
        if (hasError) {
            result = it.throw(hasError)
        } else if (value === TASK_CANCEL) {
            result = it.return(value)
        } else {
            result = it.next(value)
        }
        const { done, value: effect } = result
        if (!done) {
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
                            let forkTask = runSaga(env, effect.saga)
                            next(forkTask)
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
                        case effectTypes.ALL:
                            let effects = effect.effects
                            let result = []
                            let complete = 0
                            effects.forEach((effect, index) => runSaga(env, effect, (res) => {
                                result[index] = res
                                if (++complete === effects.length) {
                                    next(result)
                                }
                            }))
                            break
                        case effectTypes.CANCEL:
                            effect.task.cancel()
                            next()
                            break
                        default:
                            break;
                    }
                }
            }
        } else {
            callback && callback(effect)
        }
    }
    next()
    return task
}

export default runSaga