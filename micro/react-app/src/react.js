import { findDOM } from './react-dom'
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
    this.emitUpdate()
  }
  emitUpdate = () => {
    this.updateComponent()
  }
  updateComponent = () => {
    const { classInstance, pendingState } = this
    if(pendingState.length) {
      shouldUpdate(classInstance, this.getState())
    }
  }
  getState = () => {
    const {classInstance,pendingState} = this
    let {state} = classInstance
    pendingState.forEach((partialState) => {
      state = {...state, ...partialState}
    })
    pendingState.length = 0 // 清空等待生效的状态的数组
    return state
  }
}

function shouldUpdate(classInstance, nextState) {
  classInstance.state = nextState
  classInstance.forceUpdate() // 强制更新
}

class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.updater = new Updater(this)
  }
  // 类组件更新
  setState(partialState) {
    this.updater.addState(partialState)
  }

  // 根据新的属性状态，计算新的要渲染的虚拟DOM
  forceUpdate() {
    console.log('Component forceUpdate')
    let oldRenderVdom = this.oldRenderVdom // 上一次render方法计算得到的虚拟DOM
    let oldDom = oldRenderVdom.dom
    oldDom = findDOM(oldRenderVdom) // 获取oldRenderVdom对应的真实DOM
  }
}

const React = {
  createElement,
  Component
}
export default React