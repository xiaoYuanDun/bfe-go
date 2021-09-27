import React from 'react'
import actions1 from '../store/actions/counter1'
import { useSelector, useBoundDispatch } from '../react-redux'

function Counter3(props) {
    const state = useSelector((state) => state.counter1)
    const { number } = state
    const { add1, minus1 } = useBoundDispatch(actions1)
    return <div>
        {number}
        <button onClick={add1}>+</button>
        <button onClick={minus1}>-</button>
    </div>
}


export default Counter3