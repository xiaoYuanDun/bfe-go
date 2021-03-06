import * as actionTypes from './action-types'
export default {
    asyncAdd: () => {
        return {
            type: actionTypes.ASYNC_ADD
        }
    },
    add: () => {
        return {
            type: actionTypes.ADD
        }
    },
    cancelAdd: () => {
        return {
            type: actionTypes.CANCEL_ADD
        }
    }
}