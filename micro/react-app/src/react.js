
import { Component } from './Component'
import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_FRAGMENT } from './constant'
import { wrapToVdom } from './utils'

function createElement(type, config, children) {
  let ref // 可以通过ref引用此元素
  let key // 可以唯一标识一个子元素
  if (config) {
    delete config.__source
    delete config.__self
    ref = config.ref
    key = config.key
    delete config.ref
    delete config.key
  }
  let props = { ...config }
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  } else {
    props.children = wrapToVdom(children)
  }
  return { $$typeof: REACT_ELEMENT, type, ref, key, props }
}

function createRef() {
  return {
    current: null
  }
}

function forwardRef(render) { // 创建一个函数组件的ref
  return {
    $$typeof: REACT_FORWARD_REF,
    render
  }
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment: REACT_FRAGMENT // Fragment其实就是一个Symbol
}
export default React