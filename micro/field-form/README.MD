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

这里在着重说一下 Field 的初始化逻辑, 因为一个 Field 组件里包含了当前表单项的所有信息, 且源码中的 Field 使用 classComponent 编写, 所以可以通过 this 轻松引用到

1. 判断当前 Field 是够在正确的位置(Form 内部)
2. 初始化 Field 值, `initEntityValue(this)`, 把 `name-value` 对应关系初始化到 form.store 上(如果 Field 上存在 initialValue 的话), 注意这一步仅仅是简单向 formInstance 里写入初始表单值
3. `registerField(this)` 是直接把当前 Field 实例推到 `fieldEntities` 数组中进行管理, 同时注册当前 Field 还会生成一个卸载函数 `cancelRegister`, 用来从 `fieldEntities` 移除自身, 并且做一些和 `preserve` 相关的收尾逻辑, `cancelRegister` 会在当前 Field 卸载时(componentWillUnmount)被调用

截止目前, 已经还原了 Form, Field, useForm 的基本初始化逻辑, 下面看下 Field 是如何把每次的值变换反馈到 formInstance 的

### Field 与 Form 的绑定

在使用过程中, 仅仅把表单组件放在 Field 中间, 就可以实现 onChange 的绑定关系, 无需手动添加, 这是如何实现的呢?

Field 拿到 children 后, 会在内部调用 cloneElement 重新构造子元素, 同时构建 onChange 等控制属性, 把他们作为 props 传入新的 ReactElement, 源码中是在`getControlled` 中来构建这些控制属性的

Field 中默认的 trigger 是 onChange 事件, 如果用户在 props 中提供了 onChange, 那这个 onChange 会被保留引用, 在处理完内部 dispath 逻辑后, 在调用这个 originOnChange 时间, 有点像 React 和 singleSPA 的事件代理,

每次 Field 触发 onChange 事件, 回收先调用 dispatch 一个 **updateValue** 的 action, 在 formInstance 内部调用 `updateValue` 更新 store 内的表单值, 然后是 notifyObservers 逻辑(这个后面单独讲), 然后就是调用所有 Field 的 onStoreChange, 由每个 Field 自己判断是否需要 re-render, 如果需要, 就触发 `forceRender` 重新渲染本身, 而下次继续构造 Field 的时候(`React.cloneElement(child, getControlled(child.props))`), 直接从 formInstance 中就可以拿到最新的值, 基本上一个完整的更新逻辑就完成了

### TODO

Field 代码量比较大, 梳理清楚再更新下面的
