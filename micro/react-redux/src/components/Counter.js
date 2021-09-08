import React from 'react'
import { createStore } from '../redux'

const ADD = 'ADD'
const MINUS = 'MINUS'
const initialState = {
    number: 1
}
const reducer = function (state = initialState, action) {
    switch (action.type) {
        case ADD:
            return {
                number: state.number + 1
            }
        case MINUS:
            return {
                number: state.number - 1
            }
        default:
            return state
    }
}

const store = createStore(reducer, initialState)


export default class Counter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            number: store.getState().number
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            this.setState({
                number: store.getState().number
            })
        })
    }
    render() {
        return <div>
            {this.state.number}
            <button onClick={() => store.dispatch({ type: ADD })}>+</button>
            <button onClick={() => store.dispatch({ type: MINUS })}>-</button>
        </div>
    }
}