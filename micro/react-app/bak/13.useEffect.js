import React from './react'
import ReactDom, { useEffect, useState } from './react-dom'

const TestUseEffect = () => {
  console.log('counter render')
  const [number, setNumber] = useState(0)
  useEffect(() => {
    console.log('开启定时器')
    const timer = setInterval(function () {
      console.log('执行定时器')
      setNumber(number => number + 1)
    }, 1000)
    return () => {
      console.log('销毁定时器')
      clearInterval(timer)
    }
  }, [number])
  return <div>
    {number}
  </div>
}


ReactDom.render(<TestUseEffect />, document.getElementById('root'))
