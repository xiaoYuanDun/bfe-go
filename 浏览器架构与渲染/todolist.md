### 浏览器架构

- CORB，https://www.chromium.org/Home/chromium-security/corb-for-developers/

- 细节还需要补充
  网络线程/进程，判断 content-type 是否 HTML
  输入 URL 后，UI 线程会更新浏览器 loading 效果，期间可能会发生重定向，还需要更新 URL，最终得到响应体

- 网络线程发出请求后，UI 线程可能会并行的开始准备一个渲染进程待命，如果重定向且是不同域，可能不会使用这个待命渲染进程，而重新准备一个

- commit navigation 之后 UI 线程会把当前导航地址更新到 history

- 完成渲染后（所有 DOM frame 的 onLoad 事件全都执行完毕），IPC 通知浏览器进程，UI 线程停止 loading 效果，实际上此时可能还会有异步资源没有被解析显示

- 页面加载，卸载前后的 hook。unload，beforeUnload 等

- service worker 看情况复习，没有实践经验

- 一个 tab 页内的所有事情，都是由当前的渲染进程负责的

### 渲染进程

- HTML 分词，错误处理，看情况了解 https://html.spec.whatwg.org/multipage/parsing.html#an-introduction-to-error-handling-and-strange-cases-in-the-parser

- 解析模型 https://html.spec.whatwg.org/multipage/parsing.html#overview-of-the-parsing-model

- HTML 解析器，看情况了解 https://mathiasbynens.be/notes/shapes-ics

- 给 script 标签加上 defer/async 标签，避免这种停止解析的情况，或者使用 javascript module（默认就是 defer）

- 资源优先级 https://web.dev/fast/#prioritize-resources

- js 执行优化，https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution

- 旧栅格化，以视口为基础，优先栅格化视口内的页面，发生滚动后，空白的区域继续栅格化

- 布局树生成图层树的规则，不知道会不会问到

- CSS 样式，渲染触发表 https://csstriggers.com/

- 

---
### 下面的资料可以看看

- https://web.dev/why-speed-matters/

- 