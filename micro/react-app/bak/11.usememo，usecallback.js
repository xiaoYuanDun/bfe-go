import React from './react'
import ReactDom, { useState, useCallback, useMemo } from './react-dom'

const MemoCount = React.memo(HookCount)

function HookTest() {
  const [name, setName] = useState()
  const [count, setCount] = useState(0)
  const handleClick = () => {
    setCount(count + 1)
  }
  const callbackFn = useCallback(handleClick, [count])
  console.log('app render')
  const data = useMemo(() => ({ count }), [count])
  return <div>
    <input value={name} onChange={e => setName(e.target.value)} />
    <MemoCount data={data} onClick={callbackFn} />
  </div>
}

function HookCount({ data, onClick }) {
  console.log('count render')
  return <button onClick={onClick}>
    {data.count}
  </button>
}

ReactDom.render(<HookTest />, document.getElementById('root'))
