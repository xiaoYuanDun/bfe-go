import reducer from './reducers/counter1'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../redux-saga'
import rootSaga from './rootSaga'
// 需要执行函数返回一个saga中间件
const sagaMiddleware = createSagaMiddleware()

const store = applyMiddleware(sagaMiddleware)(createStore)(reducer)
// run方法放入一个根saga，作为派发和执行用
// 虽然加了派发和执行，但是用原生的action还是可以用的
sagaMiddleware.run(rootSaga)

export default store