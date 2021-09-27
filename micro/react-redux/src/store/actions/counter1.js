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

export function ThunkAdd() {
    return (dispatch) => {
        setTimeout(() => {
            dispatch({
                type: actionType.ADD1
            })
        }, 1000)
    }
}

export function PromiseAdd() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let random = Math.random()
            if (random > 0.5) {
                resolve({
                    type: actionType.ADD1
                })
            } else {
                reject({
                    type: actionType.MINUS1
                })
            }
        }, 1000)
    })
}

export function PromiseAdd2() {
    return {
        type: actionType.ADD1,
        payload: new Promise((resolve, reject) => {
            setTimeout(() => {
                let random = Math.random()
                if (random > 0.5) {
                    resolve(1)
                } else {
                    reject(-1)
                }
            }, 1000)
        })
    }
}

export default {
    add1,
    minus1,
    ThunkAdd,
    PromiseAdd,
    PromiseAdd2
}