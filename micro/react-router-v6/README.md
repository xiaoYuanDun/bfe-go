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
