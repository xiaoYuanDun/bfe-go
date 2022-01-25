import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from "react-dom";
import App from "./App";


// const ele = <App />

function useEff(func, deps = undefined) {
  const mount = useRef(false)

  useEffect(() => {
    if (!mount.current) {
      mount.current = true
    } else {
      func()
    }
  }, deps)
}

function Aaa() {


  const [id, setId] = useState(1);

  useEffect(() => {
    console.log('useEffect');
  })

  useEff(() => console.log('useEff'))

  return <div>1<button onClick={() => setId(id + 1)}>click me</button></div>
}

const ele = <Aaa />



ReactDOM.render(ele, document.getElementById('root'));
