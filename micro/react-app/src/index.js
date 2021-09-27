import React from './react'
import ReactDom, { useEffect, useState, useRef, useImperativeHandle } from './react-dom'

function Child(props, ref) {
  const inputRef = useRef()
  // 只给父组件提供需要的方法，对方法进行限制
  useImperativeHandle(ref, () => {
    return {
      focus () {
        inputRef.current.focus()
      }
    }
  })
  return <input ref={inputRef} />
}

const ForwardChild = React.forwardRef(Child)

function InputButton() {
  const ref = useRef()
  const handleClick = () => {
    ref.current.focus()
    // ref.current.remove()
  }
  return <div>
    <ForwardChild ref={ref} />
    <button onClick={handleClick}>聚焦</button>
  </div>
}


ReactDom.render(<InputButton />, document.getElementById('root'))
