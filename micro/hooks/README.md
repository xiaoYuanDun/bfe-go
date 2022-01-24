# react-router-v6 实现和文档翻译

## 翻译

- 确定仓库，确定任务分配流程，review 规则
- github project
- github api

- [fork 相关操作](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)

- [PR 相关操作](https://juejin.cn/post/6844903821521469448)

- [工具准备](https://blog.csdn.net/Jin_Kwok/article/details/104350548)

## 实现

### 先抛出几个问题，帮助聚焦重点实现

- 如何监听路由变化的
- 如何做到特定路由渲染特定组件的
- 嵌套路由是怎么合并的
- 匹配路由时 `more specific` 怎么做的
- 多级路由和嵌套组件是一一匹配的，每匹配渲染完一个组件，剩下的逻辑是如何继续下发的
- 应用只能有一个 Router，但可以有多个 Routes，不同 Routes 是如果做逻辑和数据分离的，重难点是 “嵌套的 Routes” 的渲染逻辑
- 嵌套 Route 的 path 属性，如何已经为什么检查是否 '/' 开头
- Outlet 是如何代替子元素的

###

---

## history

- `history` 的结构

```js
const history: {

}
```

### 路由容器：BrowserRouter，HashRouter

### 嵌套组件的实现（与 V5 不同）

### 嵌套路由与 Outlet

### style，classname 做了 renderProps 处理

## 奇技淫巧

- Route 的使用，本身没有 return，可以作为一个强制用户固定格式的 `slot`

- 现在有这样一个路由路径，`path='/parent[name]'`，表示要在路由确切匹配到 `/, p, a, r, e, n, t, [, n, a, m, e, ]` 字符时，从进行渲染，可是，`[`，`]` 这两个字符在正则中属于有特殊符号，那么我们需要对 path 中的特殊符号做一下转移处理，如下：`/parent\[name\]`，而在 react-router 中，在匹配路由前，首先要把各个 path 转换成对应的正则表达式，使用的是 `new RegExp` 的形式，参数是一串字符串，而我们要得到一个 `parent\[name\]` 这样一个字符串，需要在字符串文字级别转移它，即 `parent\\[name\\]`，`/a\*b/` 和 `new RegExp("a\\*b")` 创建出来的表达式是等效的
