import { createDom, findDOM, compareTwoVdom } from './react-dom'
// 全局更新队列
export let updateQueue = {
  isBatchingUpdate: false, // 默认是非批量，同步的
  updaters: [], // 更新器数组
  batchUpdate() {
    for (let updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    updateQueue.updaters.length = 0
    updateQueue.isBatchingUpdate = false
  }
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
  // 触发更新 状态和属性变化都可能会执行这个方法
  emitUpdate = (nextProps) => {
    this.nextProps = nextProps
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.push(this)
    } else {
      this.updateComponent()
    }
  }
  updateComponent = () => {
    const { classInstance, nextProps, pendingState } = this
    if (nextProps || pendingState.length) {
      shouldUpdate(classInstance, nextProps, this.getState())
    }
  }
  getState = () => {
    const { classInstance, pendingState } = this
    let { state } = classInstance
    pendingState.forEach((partialState) => {
      if (typeof partialState === 'function') {
        partialState = partialState(state)
      }
      state = { ...state, ...partialState }
    })
    pendingState.length = 0 // 清空等待生效的状态的数组
    return state
  }
}

function shouldUpdate(classInstance, nextProps, nextState) {
  let willUpdate = true// 表示组件是否更新
  classInstance.state = nextState // 更新state状态
  // 如果有shouldComponentUpdate方法并且shouldComponentUpdate返回了false
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate()
  }

  // 不管要不要更新组件，状态都要更新
  if (nextProps) {
    classInstance.props = nextProps
  }

  if (willUpdate) {
    classInstance.forceUpdate() // 强制更新
  }
}

export class Component {
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
    let oldRenderVdom = this.oldRenderVdom // 上一次render方法计算得到的虚拟DOM
    let oldDOM = findDOM(oldRenderVdom) // 获取oldRenderVdom对应的真实DOM
    // getDerivedFromProps 传入新的props参数，和旧的state进行对比，然后返回值赋给state
    if (this.constructor.getDerivedStateFromProps) {
      const newState = this.constructor.getDerivedStateFromProps(this.props, this.state)
      if (newState) {
        this.state = newState
      }
    }
    // getSnapshotBeforeUpdate 在render前执行，可以获取到渲染前的dom实例
    let snapshot = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate()

    let newVdom = this.render() // 类组件的render方法，在之前已经将state重新赋值

    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newVdom)
    // let newDOM = createDom(newVdom)
    // oldDOM.parentNode.replaceChild(newDOM, oldDOM) // 直接替换节点，没有做任何优化
    this.oldRenderVdom = newVdom
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot)
    }
  }
}