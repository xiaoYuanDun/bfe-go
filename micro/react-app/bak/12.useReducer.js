import React from './react'
import ReactDom, { useReducer } from './react-dom'

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return {
        number: state.number + 1
      }
    case 'MINUS':
      return {
        number: state.number - 1
      }
    default:
      return state
  }
}

function HookTest() {
  const [state, dispatch] = useReducer(reducer, {
    number: 0
  })
  return (
    <div>
      {state.number}
      <button onClick={() => dispatch({ type: 'ADD' })}>+</button>
      <button onClick={() => dispatch({ type: 'MINUS' })}>-</button>
    </div>
  )
}


ReactDom.render(<HookTest />, document.getElementById('root'))
