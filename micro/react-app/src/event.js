import { updateQueue } from "./Component"

/**
 * 实现合成事件或者事件委托
 * 在每一个dom上放入store对象，将事件放在里面，检测document是否绑定了on事件，没有则绑定，然后合成事件
 * document发生点击时，逐层检测是否该该层dom是否有store属性，有则触发
 * @param {*} dom 绑定事件的dom元素
 * @param {*} eventType 事件类型
 * @param {*} eventHandler 事件的处理函数
 */
export function addEvent(dom, eventType, eventHandler) {
  let store
  if (dom._store) {
    store = dom._store
  } else {
    dom._store = {}
    store = dom._store
  }
  // onclick
  store[eventType] = eventHandler
  // document.onclick
  if (!document[eventType]) {
    document[eventType] = dispatchEvent
  }
}

/**
 * 不管点什么按钮，触发什么事件，最终执行的都是这个方法
 * 在合成事件里，状态的更新是批量的
 * 绑定了一个事件在document上
 * @param {*} event 原生的事件对象
 */
function dispatchEvent(event) {
  // target = button type = click

  let { target, type } = event
  let eventType = 'on' + type
  // 把批量更新，全局变量设置为true
  updateQueue.isBatchingUpdate = true
  // 合成事件
  let syntheticEvent = createSyntheticEvent(event)

  // 当有点击时，会一层层往上找，观察是否有_store这个属性，有则取出该对象对应的eventType函数，然后传入合成的event
  // 一层层往上找，直到冒泡为止
  let currentTarget = target
  while (currentTarget) {
    let { _store } = currentTarget
    let eventHandler = _store && _store[eventType]
    syntheticEvent.target = target
    syntheticEvent.currentTarget = currentTarget
    eventHandler && eventHandler.call(target, syntheticEvent)
    currentTarget = currentTarget.parentNode
  }
  updateQueue.batchUpdate() // 进入更新
}

// 生成合成事件
// 将event的值全部放入syntheticEvent里面，然后更改里面的部分方法，做到兼容
function createSyntheticEvent(event) {
  let syntheticEvent = { nativeEvent: event }
  for (let key in event) {
    syntheticEvent[key] = event[key]
  }

  // 兼容各种方法，ie8...
  syntheticEvent.stopPropagation = (event) => {
    if (!event) {
      window.event.cancelBubble = true
    }
    if (event.stopPropagation) {
      event.stopPropagation()
    }
  }
  return syntheticEvent
}