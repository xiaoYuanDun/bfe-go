import React from 'react';
import ReactDOM from 'react-dom';
import dva, { connect } from './dva'

const app = dva()
app.model({
  namespace: 'counter',
  state: { number: 0 },
  reducers: {
    add(state, number) {
      return {
        number: state.number + 1
      }
    },
    minus(state, number) {
      return {
        number: state.number - 1
      }
    }
  },
  effects: {
    *asyncAdd(payloady, { call, put, delay }) {
      yield delay(1000)
      yield put({
        type: 'add'
      })
    }
  }
})


function Counter(props) {
  return <div>
    {props.number}
    <button onClick={() => {
      props.dispatch({ type: 'counter/add' })
    }}>+</button>
    <button onClick={() => {
      props.dispatch({ type: 'counter/asyncAdd' })
    }}>asyncAdd</button>
  </div>
}

const ConnectCounter = connect(state => state.counter)(Counter)

app.router(() => <ConnectCounter />)

app.start('#root')