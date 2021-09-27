import createChannel from "./createChannel"
import runSaga from "./runSaga"


function createSagaMiddleware() {
    let boundRunSaga
    const channel = createChannel()

    function sagaMidddleware({ getState, dispatch }) {
        const env = {
            getState,
            dispatch,
            channel
        }
        boundRunSaga = runSaga.bind(null, env)
        return function (next) {
            return function (action) {
                const result = next(action)
                channel.emit(action)
                return result
            }
        }
    }
    sagaMidddleware.run = (saga) =>  boundRunSaga(saga)
    return sagaMidddleware

}

export default createSagaMiddleware