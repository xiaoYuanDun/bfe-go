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

var target = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: target,
  h: null
}
target.e = target
target.g = new Set([1, 2, 3])
console.log(target)
console.log(cloneDeep(target))
// 深拷贝
function cloneDeep(target, map = new WeakMap()) {
  if (typeof target === 'object' && target) {
    const isArray = Array.isArray(target)
    let cloneTarget = isArray ? [] : {}

    if (map.get(target)) {
      return target
    }
    map.set(target, cloneTarget)

    // 对map和set的处理
    const type = Object.prototype.toString.call(target)
    if (type === '[object Set]') {
      const Ctor = target.constructor;
      cloneTarget = new Ctor()
      target.forEach((value) => {
        cloneTarget.add(cloneDeep(value))
      })
      return cloneTarget
    }

    if (type === '[object Map]') {
      const Ctor = target.constructor;
      cloneTarget = new Ctor()
      target.forEach((value, key) => {
        cloneTarget.set(key, cloneDeep(value))
      })
      return cloneTarget
    }

    for (let key in target) {

      cloneTarget[key] = cloneDeep(target[key], map)
    }
    return cloneTarget
  } else {
    // 普通类型
    return target
  }
}