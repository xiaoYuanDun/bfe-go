import { REACT_FORWARD_REF, REACT_TEXT } from "./constant"
import { addEvent } from './event'
function render(vdom, parentDOM) {
  const newDom = createDom(vdom)
  if (newDom) {
    parentDOM.appendChild(newDom)
    // componentDidMount步骤
    if (newDom._componentDidMount) {
      newDom._componentDidMount()
    }
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
  }
  else if (typeof type === 'function') {
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
      render(props.children, dom)
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
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }
  const renderdom = classInstance.render()
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderdom
  let dom = createDom(renderdom)
  // 在dom上挂载实例，方便后面调用对应方法
  dom.classInstance = classInstance
  if (classInstance.componentDidMount) {
    dom._componentDidMount = classInstance.componentDidMount.bind(classInstance)
  }
  return dom
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
  childrenVdom.forEach(v => render(v, parentDOM))
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
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  // 方法一： 直接暴力替换
  // let oldDOM = findDOM(oldVdom)
  // let newDOM = createDom(newVdom)
  // parentDOM.replaceChild(newDOM, oldDOM) // 直接替换节点，没有做任何优化
  // 方法二：按索引来进行替换
  if (!oldVdom && !newVdom) {
    return null
  }
  // 如果老的有，新的没有，卸载老节点
  else if (oldVdom && !newVdom) {
    unMountVdom(oldVdom)
    // 假如新的有，旧的没有，插入新的节点
  } else if (!oldVdom && newVdom) {
    const newDOM = createDom(newVdom)

    // 如果有下一个dom，就插在下一个dom的前面
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }


    if (newDOM._componentDidMount) {
      newDOM._componentDidMount()
    }
    // 旧的有，但是新的没有，替换新的节点
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    unMountVdom(oldVdom)
    const newDOM = createDom(newVdom)
    parentDOM.appendChild(newDOM)
    if (newDOM._componentDidMount) {
      newDOM._componentDidMount()
    }
    // 旧和新的都有，且type一致，只需要更新就可以了，复用老的节点
  } else {
    updateElement(oldVdom, newVdom)
  }
}

/**
 * 深度更新节点
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
function updateElement(oldVdom, newVdom) { // 文本节点
  if (oldVdom.type === REACT_TEXT) {
    if (oldVdom.props.contnet !== newVdom.props.content) {
      const currentDOM = newVdom.dom = findDOM(oldVdom) // 获取老的真实DOM，准备复用
      currentDOM.textContent = newVdom.props.content // 更新文本节点的内容
    }
    // 更新div或者span等原生dom，复用老的dom节点
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom) // 获取老的真实DOM，准备复用
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
    // 类组件和函数式组件
  } else if (typeof oldVdom.type === 'function') {
<<<<<<< HEAD
    // 类组件
    if (oldVdom.type.isReactComponent) {
      newVdom.classInstance = oldVdom.classInstance
=======
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      // 函数组件
      updateFunctionComponent(oldVdom, newVdom)
>>>>>>> 5e8e7abde1abbe619ba5cee7d58ac2c478ba7d9a
    }
  }
}
// 类组件更新
function updateClassComponent(oldVdom, newVdom) {
  let classInstance = newVdom.classInstance = oldVdom.classInstance
  let renderVdom = newVdom.oldRenderVdom = oldVdom.oldRenderVdom
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props)
  }
  classInstance.updateProps.emitUpdate(newVdom.props)
}
// 函数组件更新
function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  let parentDOM = currentDOM.parentNode
  let { type, props } = newVdom
  let newRenderVDOM = type(props)
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVDOM)
  newVdom.oldRenderVdom = newRenderVDOM
}
// 更新子组件
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  let oldChildren = Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren] : []
  let newChildren = Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren] : []
  let maxChildrenLength = Math.max(oldChildren.length, newChildren.length)
  for (let i = 0; i < maxChildrenLength - 1; ++i) {
    // 视图取出当前节点的下一个，最近的弟弟真实DOM
    let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], findDOM(nextVdom))
  }
}

/**
 * 将ref.current设置null
 * 假如是类组件，则看是否有unmount方法，有则调用
 * 删除监听事件
 * @param {*} vdom 虚拟dom
 */
function unMountVdom(vdom) {
  let { props, ref } = vdom
  let currentDOM = findDOM(vdom) // 获得此虚拟DOM对应的真实DOM
  // 是类组件，且有unMount方法，则执行
  if (vdom.classInstance && vdom.classInstance.componentWillUnMount) {
    vdom.classInstance.componentWillUnMount()
  }

  if (ref) {
    ref.current = null
  }

  Object.keys(props).forEach(propName => {
    // 假如绑定的是在dom上
    // if (propName.slice(0, 2) === 'on') {
    //   const handleEvent = propName.slice(2).toLocaleLowerCase() //onClick => click
    //   currentDOM.removeEventListener(handleEvent)
    // }
    // 因为所有都是绑定在document上的，所以只需要删除dom上的_store属性即可
    if (propName.startsWith('on')) {
      delete currentDOM._store
    }
  })

  if (props.children) {
    const children = Array.isArray(props.children) ? props.children : [props.children]
    children.forEach(unMountVdom)
  }

  // 把自己这个虚拟DOM对应的真实DOM从界面删除
  currentDOM.parentNode.removeChild(currentDOM)
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