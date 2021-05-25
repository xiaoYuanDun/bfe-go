const ele = {
  type: "div",
  props: {
    id: "A1",
    children: [{
      type: "div",
      props: {
        id: "B1",
        children: [{
          type: "div",
          props: {
            id: "C1",
          }
        }, {
          type: "span",
          props: {
            id: "C2"
          }
        }]
      }
    }, {
      type: "div",
      props: {
        id: "B2",
      }
    }]
  }
}


console.log('ele', ele)

const container = document.getElementById("root")

// 下一个工作单元
// 默认的第一个工作单元是一个最顶级的root节点, 包含了根容器dom, 所有我们自定义的react节点都是其子节点
// 可以把这个默认节点看成根 fiber 节点, stateNode 表示这个 fiber 节点对用的真实 dom 节点
const workInProgressRoot = {
  stateNode: container,
  props: {
    children: [ele]
  }
}

let nextUnitOfWork = workInProgressRoot

function workLoop() {
  // performUnitOfWork 会返回下一个工作单元的引用, 若存在下一个任务, 则一直进行下去
  while(nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }

  // nextUnitOfWork 队列清空, 表示 render 阶段结束, 开始 commit 阶段
  if(!nextUnitOfWork) {
    commitRoot()
  }
}

function commitRoot() {
  console.log(workInProgressRoot)
}

function performUnitOfWork(workInProgressFiber) {
  
  // 构建子fiber
  beginWork(workInProgressFiber)
  // beginWork 执行完之后, 下面的代码里操作的就全都是 fiber 类型的节点
  
  // fiber 树的遍历规则是, 父节点 -> 子节点 -> 兄弟节点(dfs)
  // 完成 beginWork 后, 若存在 child 则直接返回此子节点
  if(workInProgressFiber.child) {
    return workInProgressFiber.child
  }

  // 这里注意, 当一个节点所有子节点完成, 此节点才算完成
  // 当一个节点没有下一个兄弟节点也没有子节点, 表示这一层全部完成, 返回父节点执行相同操作
  // 每个fiber节点是否完成取决于下一层最后一个fiber是否完成, 所以这里使用 while 来统一向上查找并完成
  // 这里好好体会一下 
  while(workInProgressFiber) {
    completeUnitOfWork(workInProgressFiber)
    if(workInProgressFiber.sibling) {
      return workInProgressFiber.sibling
    }
    workInProgressFiber = workInProgressFiber.return
  }
}

// 经过 debug 可以发现, beginWork 其实是构建当前fiber节点的子fiber节点
// 同时构建当前fiber节点和第一个子fiber节点的关联(若存在), 子节点之间的关联(若存在)
// 如何构建: 
//   根据 虚拟dom 携带的 属性type 创建对应的真实dom, 不挂载(stateNode)
//   构建上下级关联(child), 同级关联(sibling)
//   注意若当前节点存在多个子节点, 只会通过 child 关联第一个子节点; 同级节点从前到后通过 sibling 关联
function beginWork(workInProgress) {
  console.log('开始 ', workInProgress.props.id)

  // 判断当前 fiber 节点是否有对用的真实 dom, 若没有则根据 type 创建一个
  if(!workInProgress.stateNode) {
    workInProgress.stateNode = document.createElement(workInProgress.type)
  }
  // 把虚拟 dom 中的出了 children 的属性都赋予真实 dom 节点
  for(let key in workInProgress.props) {
    if(key !== 'children') {
      workInProgress.stateNode[key] = workInProgress.props[key]
    }
  }

  // 处理关联关系 
  let prevFiber = null
  if(Array.isArray(workInProgress.props.children)) {
    workInProgress.props.children.forEach((child, index) => {
      const childFiber = {
        type: child.type,
        props: child.props,
        return: workInProgress,
        effectTag: 'PLACEMENT'
      }
      // 通过 child 关联首个子fiber
      if(index === 0) {
        workInProgress.child = childFiber
      } else {
        // 通过 sibling 关联下一个兄弟fiber
        prevFiber.sibling = childFiber
      }
      prevFiber = childFiber
    })
  }
}

// 主要是用来构建 副作用链
// 最后一级的首个fiber节点的 completeUnitOfWork 肯定第一个完成
// 所有节点的 completeUnitOfWork 工作顺序就是: 从下到上, 从左到右的把副作用归并到父fiber节点的过程
function completeUnitOfWork(workInProgress) {
  console.log('完成 ', workInProgress.props.id)
  
  let returnFiber = workInProgress.return

  if(returnFiber) {
    // 父级fiber不存在firstEffect, 表示当fiber是父级fiber的第一个子节点
    if(!returnFiber.firstEffect) {
      returnFiber.firstEffect = workInProgress.firstEffect
    }
    if(workInProgress.lastEffect) {
      // 若父级fiber存在lastEffect, 表示当前fiber不是父级fiber的首个子节点, 要进行归并操作
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
      }
      returnFiber.lastEffect = workInProgress.lastEffect
    }
    // 若当前fiber含有 effectTag, 表示自身也有副作用, 也要放在副作用链中
    if(workInProgress.effectTag) {
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workInProgress
      } else {
        returnFiber.firstEffect = workInProgress
      }
      returnFiber.lastEffect = workInProgress
    }
  }
}

console.log('nextUnitOfWork', nextUnitOfWork)

// 若一帧中存在空闲时间, 则执行工作循环
requestIdleCallback(workLoop)