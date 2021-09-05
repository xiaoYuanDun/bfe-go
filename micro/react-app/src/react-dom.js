import { REACT_FORWARD_REF, REACT_TEXT, REACT_FRAGMENT, MOVE, PLACEMENT, DELETE, REACT_PROVIDER, REACT_CONTEXT, REACT_MEMO } from "./constant"
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
  // return vdom
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
  else if (type === REACT_FRAGMENT) {
    dom = document.createDocumentFragment()
  }
  else if (type && type.$$typeof === REACT_MEMO) {
    return mountMemo(vdom)
  }
  else if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProvider(vdom)
  }
  else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountContext(vdom) // 函数式组件才会用到consumer
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
      child._mountIndex = 0 // 独生子
      render(child, dom)
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

// memo渲染
function mountMemo(vdom) {
  const { type, props } = vdom
  const renderVdom = type.type(props)
  vdom.oldRenderVdom = renderVdom // 用于findDOM
  vdom.prevProps = props // 在vdom下，记录上一次的属性对象
  return createDom(renderVdom)
}

// provider渲染
function mountProvider(vdom) {
  const { type, props } = vdom
  const context = type._context
  context._currentValue = props.value
  const renderVdom = props.children
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

// consumer渲染
function mountContext(vdom) {
  const { type, props } = vdom
  const vdomfn = props.children //函数式组件用consumer， 为一个函数
  const context = type._context
  const renderVdom = vdomfn(context._currentValue)
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

// 类组件渲染
function mountClassComponent(vdom) {
  const { type: ClassComponent, props, ref } = vdom
  const classInstance = new ClassComponent(props)
  if (ref) { // 类组件的ref就是类本身
    ref.current = classInstance
  }
  // 有上下文contxt时需要赋值到类实例的context上
  if (ClassComponent.contextType) {
    classInstance.context = ClassComponent.contextType._currentValue
  }
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }
  const renderdom = classInstance.render()

  vdom.classInstance = classInstance

  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderdom
  let dom = createDom(renderdom)
  if (!dom) {
    return
  }
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
  childrenVdom.forEach((childVdom, index) => {
    childVdom._mountIndex = index
    render(childVdom, parentDOM)
  })
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
      // dom[key.toxLocaleLowerCase()] = newProps[key] 
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
function updateElement(oldVdom, newVdom) {

  if (oldVdom.type && oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProvider(oldVdom, newVdom)
  } else if (oldVdom.type && oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContext(oldVdom, newVdom)
  }
  // 更新memo
  else if (oldVdom.type && oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemo(oldVdom, newVdom)
  }
  // 文本节点
  else if (oldVdom.type === REACT_TEXT) {
    if (oldVdom.props.content !== newVdom.props.content) {
      const currentDOM = newVdom.dom = findDOM(oldVdom) // 获取老的真实DOM，准备复用
      currentDOM.textContent = newVdom.props.content // 更新文本节点的内容
    }
    // 更新div或者span等原生dom，复用老的dom节点
  } else if (oldVdom.type === REACT_FRAGMENT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  }

  else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom) // 获取老的真实DOM，准备复用
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
    // 类组件和函数式组件
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      // 函数组件
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

// 更新memo
function updateMemo(oldVdom, newVdom) {
  const { prevProps, type } = oldVdom
  const { props: newProps, type: newType } = newVdom
  if (type.compare(prevProps, newProps)) {
    newVdom.prevProps = oldVdom.prevProps
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom
    return;
  } else {
    const currentDom = findDOM(oldVdom)
    const parentNode = currentDom.parentNode
    let renderVdom = newType.type(newProps)

    compareTwoVdom(parentNode, oldVdom.oldRenderVdom, renderVdom)
    newVdom.prevProps = newVdom.props
    newVdom.oldRenderVdom = renderVdom
  }

}
// 更新provider
function updateProvider(oldVdom, newVdom) {
  let currentDom = findDOM(oldVdom) // div
  let parentDom = currentDom.parentNode // div#root
  let { type, props } = newVdom
  let context = type._context
  context._currentValue = props.value
  let renderVdom = props.children
  compareTwoVdom(parentDom, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}
// 更新context
function updateContext(oldVdom, newVdom) {
  const currentDom = findDOM(oldVdom)
  const parentDom = currentDom.parentNode
  const { type, props } = newVdom
  const context = type._context
  let renderVdom = props.children(context._currentValue)
  compareTwoVdom(parentDom, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}

// 类组件更新
function updateClassComponent(oldVdom, newVdom) {
  let classInstance = newVdom.classInstance = oldVdom.classInstance
  let renderVdom = newVdom.oldRenderVdom = oldVdom.oldRenderVdom
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props)
  }
  classInstance.updater.emitUpdate(newVdom.props)
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
// 实现完成的domdiff算法
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  let oldChildren = Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren] : []
  let newChildren = Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren] : []
  let maxChildrenLength = Math.max(oldChildren.length, newChildren.length)
  // key方法对比
  // 省略了type方法对比
  let lastPlaceIndex = 0 // 上一个不需要移动的老DOM节点的索引
  let oldChildMap = {} // 旧child索引
  let patch = [] // 对字段进行操作
  oldChildren.forEach((oldVChild, index) => {
    oldVChild._mountIndex = index
    let oldKey = oldVChild.key || index
    oldChildMap[oldKey] = oldVChild
  })

  newChildren.forEach((newVChild, index) => {
    newVChild._mountIndex = index
    const newKey = newVChild.key || index
    const oldVChild = oldChildMap[newKey]
    if (oldVChild) {
      if (newVChild.key)
        console.log(`更新${newVChild.key}`)
      updateElement(oldVChild, newVChild)
      if (oldVChild._mountIndex < lastPlaceIndex) {
        patch.push({
          fromIndex: oldVChild._mountIndex,
          type: MOVE,
          oldVChild,
          newVChild,
          toIndex: index
        })
      }
      delete oldChildMap[newKey]
      lastPlaceIndex = Math.max(lastPlaceIndex, oldVChild._mountIndex)
    } else {
      // 没有找到，就是插入
      patch.push({
        type: PLACEMENT,
        newVChild,
        toIndex: index
      })
    }
  })
  // 剩余的old Child需要删除和move的一起删除，move的后面再加上
  const moveChildrens = patch.filter((i) => i.type === MOVE).map(i => i.oldVChild)
  Object.values(oldChildMap).concat(moveChildrens).forEach((oldVChild) => {
    // 直接在dom上删除该元素
    const oldDom = findDOM(oldVChild)
    oldDom.parentNode.removeChild(oldDom)
    // patch.push({
    //   type: DELETE,
    //   oldChild: oldChildMap[key],
    //   fromIndex: oldChildMap[key]._mountIndex
    // })
  })

  if (patch.length) {
    // 对元素进行操作
    patch.forEach((item) => {
      const { fromIndex, toIndex, type, oldVChild, newVChild } = item
      const childNodes = parentDOM.children // 找到目前的子集
      if (type === PLACEMENT) {
        const newDOM = createDom(newVChild) // 拿到新的dom插入
        const childDOM = childNodes[toIndex]
        if (childDOM) {
          parentDOM.insertBefore(newDOM, childDOM)
        } else {
          parentDOM.appendChild(newDOM)
        }
      } else if (type === MOVE) {
        let oldDOM = findDOM(oldVChild)
        const childDOM = childNodes[toIndex]
        if (childDOM) {
          parentDOM.insertBefore(oldDOM, childDOM)
        } else {
          parentDOM.appendChild(oldDOM)
        }
      }
    })
  }

  // 旧算法，一一对比
  // for (let i = 0; i < maxChildrenLength - 1; ++i) {
  //   // 视图取出当前节点的下一个，最近的弟弟真实DOM
  //   let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
  //   compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], findDOM(nextVdom))
  // }
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
  render,
  createPortal: render
}

export default ReactDom