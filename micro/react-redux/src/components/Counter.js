import React from 'react'
import store from '../store'
import bindActionCreators from '../redux/bindActionCreator'
import actions1 from '../store/actions/counter1'
import { connect, connectHooks } from '../react-redux'

const boundCreators = bindActionCreators(actions1, store.dispatch)


class Counter extends React.Component {
    render() {
        const { number, add1, minus1, ThunkAdd, PromiseAdd, PromiseAdd2 } = this.props
        return <div>
            {number}
            <button onClick={add1}>+</button>
            <button onClick={minus1}>-</button>
            <button onClick={ThunkAdd}>-</button>
            <button onClick={PromiseAdd}>-</button>
            <button onClick={PromiseAdd2}>+</button>
        </div>
    }
}

const mapStateToProps = (state) => state.counter1


export default connectHooks(mapStateToProps, actions1)(Counter)