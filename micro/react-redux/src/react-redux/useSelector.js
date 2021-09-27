import React, { useContext, useLayoutEffect, useReducer, useRef } from 'react'
import ReduxContext from './ReduxContext'

// 第二个参数传入旧的状态和新的状态，不相等才刷新
function useSelector(selector, equalityFn = (left, right) => left === right) {
    const { store } = useContext(ReduxContext)
    const { getState, subscribe } = store
    const state = getState()
    const lastSelectedState = useRef(null)
    const selectedState = selector(state)
    let [, forceUpdate] = useReducer((x) => x + 1, 0)
    useLayoutEffect(() => subscribe(() => {
        const state = getState()
        const selectedState = selector(state)
        console.log(lastSelectedState.current, selectedState)
        if (!equalityFn(lastSelectedState.current, selectedState)) {
            // 重新渲染
            forceUpdate()
            lastSelectedState.current = selectedState
        }
    }), [])
    return selectedState
}

export default useSelector