
- Without

- ROX

- 取出可选 number

- [T] extends [U] ? [U] extends [T]


type Compare<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
  ? true : false

- 类型关联

- never 使用，编译打包时提前抛错

- 扩展 model 的 TS 类型工具，对 service 也可以做中心化管理

- 复习一下命名空间

- 没有类型的三方库，`declear module xxx`

- tsrpc

- 新文件/通用代码片段 保持一致 snippet