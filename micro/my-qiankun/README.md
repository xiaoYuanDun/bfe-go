# single-spa

# qiankun

loadApp(HTML_url)

- import-html-entry

  - 处理 HTML，删除注释，
  - 处理 CSS，全部转换为内联形式
  - 处理 JS，全部收集到脚本数组

- 包装经过处理的 HTML，添加 qiankun 标识

- 判断宿主环境的 Proxy 支持情况

- 创建 DOM 元素

- 使用自定义 render 方法或者 qiankun 默认方法（原生 DOM）插入包装后的子应用 HTML (`getRender / render`)

- 开始创建沙盒(`createSandbox`)
  - 宿主环境如果支持 Proxy，则使用 **代理沙箱**
    - 使用
  - 宿主环境如果不支持 Proxy，则使用 **快照沙箱**

### 问题

- 子应用需要配置跨域，否则不能加载资源

- 样式隔离的方案

1. BEM 规范保证
2. css module，产生全局唯一的 class
   产生 hash 化 的 class，但是 dom 中引用类型没有发生变化

# import-html-entry
