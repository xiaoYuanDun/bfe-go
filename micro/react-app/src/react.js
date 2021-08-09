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
  return { type, ref, key, props }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance
    this.pendingState = [] // 等待生效的数组
  }
  addState = (partialState) => {
    this.pendingState.push(partialState)

  }
  emitUpdate = () => {

  }
}

class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.updater = new Updater(this)
  }
  setState(partialState) {
    this.updater.addState(partialState)
  }
}

const React = {
  createElement,
  Component
}
export default React