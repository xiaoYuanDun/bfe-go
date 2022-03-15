# 再次梳理强化一下这个流程

- 首先 react 的手写格式是 JSX/TSX，在通过 babel 处理后，会转换为 React.createElement(key, props, children) 的形式

- 准备好代码后，从根渲染方法(`ReactDOM.render`)开始执行，一般一个 createElement 的执行结果是一个 vdom，最后会到的一个嵌套的 vdom 对象，表示一个从根节点开始，包含所有子节点的树结构

- 初始化容器 fiber 节点（todo，这个节点是什么，做什么用，大概命名），作为一个起始 fiber 节点

- 开始 `render` 阶段的工作

- 不管 sync/concurrent 模式，他们都会在 render 阶段开启一个工作循环，内部会根据是否存在正在工作的节点来决定工作是否完成(根 fiber 是首个 workInProgress 节点)，只不过 concurrent 模式可能会根据当前所分配的时间片到期而终止，但同步模式不会

- render 阶段有一对方法用来处理 vdom 和生成 fiber，并且构建父子 fiber，兄弟 fiber 之间的关系：`beginWork`，`completeWork`

- 整个过程是一个 DFS 的过程

- （todo，beginWork 还干什么了）每次 beginWork 会生成当前 fiber 想的所有直接子 fiber，所有直接子 fiber 有一个 return 指针指向他们的父 fiber，也就是当前 fiber，所有直接子 fiber 之间通过 silbing 指正，按照生成顺序，从前向后的串联起来，同时返回首个子 fiber，作为这次 beginWork 的返回值，如果存在返回值，表示还存在更多子节点，会将 返回值赋予 workInProcess，开启下一次工作循环，否则

- 表示已经没有子节点了，当前 fiber 可以开始 complete 操作了，（这里 todo，completeWork 干什么了），然后检查是否存在兄弟节点，如果有就以兄弟节点为 workInProcess 开始下一次工作循环，否则

- 表示当前层级的所有节点都已经完成了 complete 工作，这时会向上递归，以他的父 fiber 为基础继续执行 completeWork 方法

- 最后所有 vdom 都变成对应的 fiber 节点，并且完成了指针关联和。。。（todo，begin，complete 都做了什么），标志着 `render` 阶段结束

- 接下来就是 `commit` 阶段

- `commitRootImpl` 里有很多注释

- `commitBeforeMutationEffects`阶段

---

### beginWork

因为双缓存机制，对于同一个阶段在同一时间可能会存在两个对应的 fiber 节点（新旧），新 fiber 可以通过 .alternate 引用到旧 fiber，做一些复用

- FC, mount, mountIndeterminateComponent, renderWithHooks

### completeWork

- 用到的原生 DOM api，createElement, appendChild

---

- FC, class 不存在实际 dom，那 complete 阶段挂载做了什么呢？
  `appendAllChildren`，本身会做一些无关 appendChild 的操作，如果其父节点是原生 DOM，并在进行 complete 操作，这是会判断 fiber 类型，如果不是原生，就递归向下寻找，知道找到第一个原生 DOM 的 fiber，并把这个 DOM 挂载到当前正在进行 complete 工作的 DOM 下
