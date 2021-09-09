import * as actionType from '../action-types'

export function add1() {
    return {
        type: actionType.ADD1
    }
}
export function minus1() {
    return {
        type: actionType.MINUS1
    }
}

export default {
    add1,
    minus1
}