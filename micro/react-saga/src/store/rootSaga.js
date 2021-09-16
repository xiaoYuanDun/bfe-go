import { take, put, select, takeEvery, call, cps, all, delay, fork, cancel } from '../redux-saga/effects'
import * as actionTypes from './action-types'
// 从effects里面拿到take和put方法
// take 监听是否有相同类型的type传入，有则执行下一步，没有则继续等待，不执行
// put 派发到真正的action里面
// 一个take，put只会执行一次，下次点击会没用

// 负责派发
function* workerSaga() {
    // const result = yield call(delay, 1000)
    const result = yield cps(delaycb, 1000)
    console.log(result)
    yield put({ type: actionTypes.ADD })
}
// 监听
function* watcherSaga() {
    yield take(actionTypes.ASYNC_ADD)

    yield workerSaga()
}

export function* add1() {
    for (let i = 0; i < 3; i++) {
        yield take(actionTypes.ASYNC_ADD);
        yield put({ type: actionTypes.ADD });
    }
    return 'add1';
}

export function* add2() {
    for (let i = 0; i < 3; i++) {
        yield take(actionTypes.ASYNC_ADD);
        yield put({ type: actionTypes.ADD });
    }
    return 'add2';
}

function delayP(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('hello')
        }, ms)
    })
}

function delaycb(ms, callback) {
    setTimeout(() => {
        callback(null, 'hellowww')
    }, ms)
}

// 取消任务
export function* add() {
    while (true) {
        yield delay(1000)
        console.log(1000)
        yield put({ type: actionTypes.ADD })
    }
}
// 取消任务
export function* addWatcher() {
    const task = yield fork(add)
    // 注册一个取消时间，当按钮点击的时候进行取消
    yield take(actionTypes.CANCEL_ADD)
    yield cancel(task)
}

// 主要分为监听watcherSaga和派发
export default function* rootSaga() {
    console.log('开始执行saga')
    // 等于另开了一个进程，后面的可以正常执行， 需要runSaga支持这种
    yield addWatcher()
    // let result = yield all([add1(), add2()]);
    // console.log('done', result)
    // yield takeEvery(actionTypes.ASYNC_ADD, workerSaga)
}

// export default function* rootSaga() {
//     console.log('开始执行saga')
//     const oldNumber = yield select((state) => state.number)
//     console.log('旧的值', oldNumber)
//     yield take(actionTypes.ASYNC_ADD)
//     yield put({ type: actionTypes.ADD })
//     const newNumber = yield select((state) => state.number)
//     console.log('新的值', newNumber)
// }