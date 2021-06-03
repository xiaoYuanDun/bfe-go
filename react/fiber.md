### TODO

- fiber 是什么
- fiber 异步可中断的工作流程是怎样的
- 副作用连是什么
- reconcilerChildren 是什么
- 合成事件，16,17 有啥区别
- DIFF 算法，单节点/多节点
- 各种中间件的实现，redux，koa
- monoRepos to npm7.workspace
- setState 各种情况 同步模式, 异步模式, setTimeout 下，同异步

##### [stack-reconciler 官方解读](https://zh-hans.reactjs.org/docs/implementation-notes.html)

### setState 的调用流程与相关问题

##### Component 在原型上实现了 setState 方法

![06614e74af65c49b1cde5b59d8ab76cc.png](en-resource://database/748:0)
