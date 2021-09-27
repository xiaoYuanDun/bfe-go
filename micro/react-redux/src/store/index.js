import { applyMiddleware } from "../react-redux"
import { createStore } from "../redux"
import rootReducer from './reducers'
import { logger } from "./redux-logger"
import { reduxPromise } from "./redux-promise"
import { reduxThunk } from "./redux-thunk"

// const store = createStore(rootReducer)
const store = applyMiddleware(reduxPromise, reduxThunk, logger)(createStore)(rootReducer)
export default store