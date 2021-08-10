import { updateQueue } from "./Component"

/**
 * 实现合成事件或者事件委托
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