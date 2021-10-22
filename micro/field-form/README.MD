### 旨在学习新版 rc-field-form 的增量更新原理

### 优化现有 actionForm, attrForm 全量渲染的性能问题

### 拆分文件目录

interface 类型接口文件
index 统一输出文件

### Form

梳理一下 Form 的基本逻辑:

1. 使用 `useContext` 取到全局 FormContext 共享变量集
2. 使用自定义 hook `useForm` 初始化一个 formStore 对象, 这个对象是整个表单的核心数据流控制器, 挂载可所有可以操作其内部数据的 API, form 可以从外部传入, 这里会在判断, 若没有外部 form, 就通过 `new FormStore(...)` 生成一个
3. 调用 `formInstance.getInternalHooks` 得到一些仅供内部使用的方法, 具体怎么控制只能从内部调用的逻辑, 可以看 `HOOK_MARK` 是怎么被使用的, 这里不赘述了
4. 然后就是一些初始化工作, 没有特别的地方, 不赘述了
5. 首次加载时(mount), 使用 initialValues 初始化 store
6. 被 Form 组件包裹的 children 有可能是普通组件, 也可以是 renderProps 方法的抽象, 在这里会分别做一下处理
7. 如果存在 fields 属性, 使用自带的 valueUtil.isSimilar 进行浅比较对比和更新
8. 把 form 数据实例和 validateTrigger 合并, 作为一个 context 提供给 Form 的 children, 一般代指 Field, **注意, 这里初始化的是 FieldContext, 这步操作的赋值, 会在 Field 初始化时用于判断, 一个 Field 是否被包含在 Form 中, (如果 Field 不在 Form 中, 那么就没有这一步初始化操作, 当我们能使用 `useContext(FieldContext)` 时, 拿到的就不是初始化赋值, 而是默认的报错警告方法, 初始化赋值会覆盖默认的警告方法)**

```js
const wrapperNode = (
  <FieldContext.Provider value={formContextValue}>{childrenNode}</FieldContext.Provider>
);
```

### Field

对外暴露的不是 Field 自己, 而是一个包裹组件 `WrapperField`, 在内部处理了一下 Field 需要用到的 key(生成规则: `'_' + (name || []).join('_')`), 同时向下传递 `fieldContext`

1. 判断当前 Field 是够在正确的位置(Form 内部)
2. 注册 Field, 把 `name-value` 对应关系绑定到 form.store 上

### TODO

Field 代码量比较大, 梳理清楚再更新下面的
