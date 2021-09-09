import * as actionTypes from '../action-types'

let initialState = {
    number: 0
}

function counter1(state = initialState, action) {
    switch (action.type) {
        case actionTypes.ADD1:
            return {
                number: state.number + 1
            }
        case actionTypes.MINUS1:
            return {
                number: state.number - 1
            }
        default:
            return state
    }
}

export default counter1