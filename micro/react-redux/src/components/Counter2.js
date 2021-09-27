import React from 'react'
import store from '../store'
import bindActionCreators from '../redux/bindActionCreator'
import actions2 from '../store/actions/counter2'

const boundCreators = bindActionCreators(actions2, store.dispatch)



export default class Counter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            number: store.getState().counter2.number
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            this.setState({
                number: store.getState().counter2.number
            })
        })
    }
    render() {
        return <div>
            {this.state.number}
            <button onClick={boundCreators.add2}>+</button>
            <button onClick={boundCreators.minus2}>-</button>
        </div>
    }
}