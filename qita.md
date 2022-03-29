64 道算法题

黄婷面筋

    https://github.com/huangt2012/interview

https://note.youdao.com/ynoteshare1/index.html?id=4ee34bd98088d4058b8a782c86ab17b9&type=note#/

网络，缓存，react，fiber

webpack 原理，用过什么插件，hmr 原理，sourcemap

https://juejin.cn/post/6947842412102287373

promise 规范，重要概念，要重新复习一下，重点方法的手写

FCP/FP

---

websocket 建立过程

uglify 原理的是什么

tree shaking 是什么，有什么作用，原理是什么

如何定位内存泄露

渲染合成层是什么

react sepense

### 日产

- 多包管理，lerna，如何打包发布
- gitHook 做 git 周期校验
  pre-commit, lint-staged
  commit-msg, 摘要规范
- 推进 TS 普及

- 大文件上传，如何分片，非阻塞任务流
- @/组件库
- @/规范
- @/hooks
- modal TS 库
- 权限装饰器
- 风格开发指引脚手架
- sequelize 整套类型定义

### 大屏重构

- 数据筛选器，插件化改造

- ? scheme 定义

- 重构
  整理数据流，最小影响原则
  TS 化

  class 继承

  项目优化点

const config = {
optimization: {
minimize: true,
noEmitOnErrors: true,
minimizer: [
// TerserPlugin
{
options: {
test: /\.[cm]?js(\?.\*)?$/i,
extractComments: false,
sourceMap: true,
cache: true,
cacheKeys: [Function],
parallel: true,
include: undefined,
exclude: undefined,
minify: undefined,
terserOptions: {
parse: { ecma: 8 },
compress: {
ecma: 5,
warnings: false,
arrows: false,
collapse_vars: false,
comparisons: false,
computed_props: false,
hoist_funs: false,
hoist_props: false,
hoist_vars: false,
inline: false,
loops: false,
negate_iife: false,
properties: false,
reduce_funcs: false,
reduce_vars: false,
switches: false,
toplevel: false,
typeofs: false,
booleans: true,
if_return: true,
sequences: true,
unused: true,
conditionals: true,
dead_code: true,
evaluate: true
},
mangle: { safari10: true },
output: { ecma: 5, comments: false, ascii_only: true }
}
}
}
]
}
}

---

---

https://draveness.me/whys-the-design/

https://segmentfault.com/a/1190000037747701

https 中间人攻击

XSS/CSRF 攻击

介绍一下 TS 泛型

介绍一下盒模型

介绍一下 redux，redux-react

promise 的链式组合

pipe

路由

缓存
