import * as actionType from '../action-types'

export function add2() {
    return {
        type: actionType.ADD2
    }
}
export function minus2() {
    return {
        type: actionType.MINUS2
    }
}

export default {
    add2,
    minus2
}