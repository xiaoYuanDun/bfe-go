import React from 'react'
import ReactDom from 'react-dom'
import { Provider, connect } from 'react-redux'
import prefixNamespace from './prefixNamespace'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import * as sagaEffects from 'redux-saga/effects'
import { NAMESPACE_SEP } from './constants'
export { connect }
function dva() {

    function model(modelObject) {
        const prefixModel = prefixNamespace(modelObject)
        app._models.push(prefixModel)
    }
    // 需要渲染组件，根组件
    function router(routerConfig) {
        app._router = routerConfig
    }
    let initialReducers = {}
    function start(selector) {
        for (const model of app._models) {
            initialReducers[model.namespace] = getReducer(model)
        }
        let rootReducers = combineReducers(initialReducers)
        // 处理effects
        const sagas = getSagas(app)
        // let store = createStore(rootReducers)
        // 改成中间件的形式
        const sagaMiddleware = createSagaMiddleware()
        const store = applyMiddleware(sagaMiddleware)(createStore)(rootReducers)
        sagas.forEach(sagaMiddleware.run)
        ReactDom.render(<Provider store={store}>
            {app._router()}
        </Provider>, document.querySelector(selector))
    }

    function getSagas(app) {
        let sagas = []
        // 对每一个model的effects进行处理
        for (let model of app._models) {
            sagas.push(getSaga(model.effects, model))
        }
        return sagas
    }

    function getSaga(effects, model) {
        return function* () {
            for (const key in effects) {
                // 每个key转换成一个watcherSaga，然后开启一个新的子进程去执行
                const watcherSaga = getWatcher(key, model.effects[key], model)
                yield sagaEffects.fork(watcherSaga)
            }
        }
    }

    function getWatcher(key, effect, model) {
        return function* () {
            yield sagaEffects.takeEvery(key, function* (action) {
                yield effect(action, {
                    ...sagaEffects,
                    // 改写put方法，因为需要加上namespace，但put在使用时不需要
                    put: (action) => sagaEffects.put({
                        ...action,
                        type: prefixType(action.type, model)
                    })
                })
            })
        }
    }

    function prefixType(type, model) {
        if (type.indexOf(NAMESPACE_SEP) !== -1) {
            console.warn(`不要加${NAMESPACE_SEP}`)
            return type
        } else {
            return `${model.namespace}${NAMESPACE_SEP}${type}`
        }
    }

    const app = {
        _models: [],
        model,
        router,
        _router: null,
        start
    }

    return app
}
// 每一个model，返回一个方法
// 以前是switch方式，现在是对象里面检测是否有这个key，有则执行该函数
function getReducer(model) {
    let { state: initialState, reducers } = model
    let reducerFn = (state = initialState, action) => {
        let reducer = reducers[action.type]
        if (reducer) {
            return reducer(state, action)
        }
        return state
    }
    return reducerFn
}
export default dva