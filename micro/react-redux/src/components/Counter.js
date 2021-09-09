import React from 'react'
import store from '../store'
import bindActionCreators from '../redux/bindActionCreator'
import actions1 from '../store/actions/counter1'

const boundCreators = bindActionCreators(actions1, store.dispatch)

console.log(boundCreators)

export default class Counter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            number: store.getState().counter1.number
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            this.setState({
                number: store.getState().counter1.number
            })
        })
    }
    render() {
        console.log('render counter1')
        return <div>
            {this.state.number}
            <button onClick={boundCreators.add1}>+</button>
            <button onClick={boundCreators.minus1}>-</button>
        </div>
    }
}