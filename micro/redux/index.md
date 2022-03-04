# redux

### createStroe

创建数据源对象，提供核心方法：`dispatch`, `getState`, `subscribe` 和 数据源对象

### combineReducers

把分散的子 reducer 合成为一个 rootReducer

### 中间件

中间件的核心实现就是接管 store 的创建，然后代理原始 dispatch 方法，多个中间件使用 compose 函数做一个 **thunk 化** 处理，相当于控制权下发，所有的中间件，按照入参顺序，都会持有下一个中间件的调用引用，我们按照固定格式实现自定义中间件后，就可以自己控制这个流程了
