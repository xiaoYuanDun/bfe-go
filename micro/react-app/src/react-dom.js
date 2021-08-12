import { REACT_FORWARD_REF, REACT_TEXT } from "./constant"
import { addEvent } from './event'
function render(vdom, container) {
  mount(vdom, container)
}

function mount(vdom, parentDOM) {
  const dom = createDom(vdom)
  if (dom) {
    parentDOM.appendChild(dom)
  }
}

export function createDom(vdom) {
  if (!vdom) {
    return null
  }
  let dom; // 真实dom
  let { type, props, ref } = vdom
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content)
  }
  else if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vdom) // 渲染有ref的函数组件
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom)
    } else {
      return mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }

  if (props) {
    updateProps(dom, {}, props)
    const child = props.children
    if (typeof child === 'object' && child.type) {
      mount(props.children, dom)
    } else if (Array.isArray(child)) {
      reconcileChildren(child, dom)
    }
  }
  vdom.dom = dom
  // 假如有ref，则给ref赋上当前的dom
  if (ref) {
    ref.current = dom
  }
  return dom
}


// 类组件渲染
function mountClassComponent(vdom) {
  const { type: ClassComponent, props, ref } = vdom
  const classInstance = new ClassComponent(props)
  if (ref) { // 类组件的ref就是类本身
    ref.current = classInstance
  }
  const renderdom = classInstance.render()
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderdom
  return createDom(renderdom)
}

// 有ref的函数组件
function mountForwardComponent(vdom) {
  const { type, props, ref } = vdom
  const renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

// 函数式组件渲染
function mountFunctionComponent(vdom) {
  let { type, props } = vdom
  let renderVdom = type(props)
  // 暂时没用，后面进行组件更新时使用
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

function reconcileChildren(childrenVdom, parentDOM) {
  childrenVdom.forEach(v => mount(v, parentDOM))
}

function updateProps(dom, oldProps, newProps) {
  // 新props
  for (const key in newProps) {
    if (key === 'children') {
      continue
    } else if (key === 'style') {
      const styleObj = newProps[key]
      for (const attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (key.startsWith('on')) { // 绑定事件
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]) // 合成事件
      // dom[key.toLocaleLowerCase()] = newProps[key] 
    } else {
      dom[key] = newProps[key]
    }
  }
}

/**
 * diff算法比较
 * @param {*} parentDOM 
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  let oldDOM = findDOM(oldVdom)
  let newDOM = createDom(newVdom)
  parentDOM.replaceChild(newDOM, oldDOM) // 直接替换节点，没有做任何优化
}

export function findDOM(vdom) {
  if (vdom.dom) {
    return vdom.dom
  } else {
    return findDOM(vdom.oldRenderVdom)
  }
}

const ReactDom = {
  render
}

export default ReactDom