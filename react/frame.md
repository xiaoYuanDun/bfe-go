## 关于浏览器中的帧的一些知识点

### requestAnimationFrame

##### requestAnimationFrame 接受一个回调函数, 执行时机在每一帧渲染前, 回调函数会被赋予一个时间戳参数, 表示了回调执行时的时刻

##### 参考 /micro/window-frame/requestAnimationFrame.html

##### https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame

##### https://developer.mozilla.org/zh-CN/docs/Web/API/DOMHighResTimeStamp

### requestIdleCallback

##### requestIdleCallback 属于实验中的 api, react 时间切片实际上做的工作就是模拟 requestIdleCallback 的执行时机

##### https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback

##### https://developer.mozilla.org/zh-CN/docs/Web/API/IdleDeadline

##### https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API#example

##### https://googlechrome.github.io/devtools-samples/jank/
