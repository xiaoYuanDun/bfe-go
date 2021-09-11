import { applyMiddleware } from "../react-redux"
import { logger } from "../react-redux/applyMiddleware"
import { createStore } from "../redux"
import rootReducer from './reducers'
// const store = createStore(rootReducer)
const store = applyMiddleware(logger)(createStore)(rootReducer)
export default store