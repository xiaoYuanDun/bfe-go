
import { Component } from './Component'
import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_FRAGMENT, REACT_CONTEXT, REACT_PROVIDER, REACT_MEMO } from './constant'
import { wrapToVdom, shallowEquals } from './utils'

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

function createContext() {
  const context = { $$typeof: REACT_CONTEXT, _currentValue: null }
  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context,
  }
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context
  }
  return context
}
// 函数组件和类组件更新
class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 如果全相等，则不更新
    return !shallowEquals(this.props, nextProps) || !shallowEquals(this.state, nextState)
  }
}

function memo(type, compare = shallowEquals) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare
  }
}



const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment: REACT_FRAGMENT, // Fragment其实就是一个Symbol
  createContext,
  PureComponent,
  memo
}
export default React