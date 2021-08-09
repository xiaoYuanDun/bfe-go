import { REACT_TEXT } from "./constant"

function render(vdom, container) {
  mount(vdom, container)
}

function mount(vdom, parentDOM) {
  const dom = createDom(vdom)
  if (dom) {
    parentDOM.appendChild(dom)
  }
}

function createDom(vdom) {
  if (!vdom) {
    return null
  }
  let dom; // 真实dom
  let { type, props } = vdom
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content)
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
  return dom
}

// 类组件渲染
function mountClassComponent(vdom) {
  const { type: ClassComponent, props } = vdom
  const classInstance = new ClassComponent(props)
  const renderdom = classInstance.render()
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderdom
  return createDom(renderdom)
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
    } else if (key.startsWith('on')) {
      dom[key.toLocaleLowerCase()] = newProps[key]
    } else {
      dom[key] = newProps[key]
    }
  }
}

export function findDOM (vdom) {
  if(vdom.dom){
    return vdom.dom
  } else{
    return findDOM(vdom.oldRenderVdom)
  }
}

const ReactDom = {
  render
}

export default ReactDom