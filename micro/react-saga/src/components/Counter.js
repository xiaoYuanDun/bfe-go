import React from 'react'
import { connect } from 'react-redux'
import action from '../store/action'
function Counter(props) {
    const { number, asyncAdd, add, cancelAdd } = props

    return <div>
        {number}
        <button onClick={asyncAdd}>AsyncAdd</button>
        <button onClick={add}>add</button>
        <button onClick={cancelAdd}>canceladd</button>
    </div>
}

export default connect(state => state, action)(Counter)