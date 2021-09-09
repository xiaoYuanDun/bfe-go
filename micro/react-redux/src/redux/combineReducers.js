function combineReducers(reducers) {
    /**
     * state 旧状态，
     * action 
     */
    return function (state = {}, action) {
        let nextState = {}
        for (let key in reducers) {
            nextState[key] = reducers[key](state[key], action)
        }
        return nextState
    }
}

export default combineReducers