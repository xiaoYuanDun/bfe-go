import { call, put, take, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  ACTION_MINUS,
  ACTION_ADD,
  ASYNC_ACTION_ADD,
  ASYNC_ACTION_MINUS,
} from './actions';

// 真正处理副作用的是这些 worker-saga
function* asyncAdd() {
  // yield take(ASYNC_ACTION_ADD);
  yield call(asyncafterSometimes);
  yield put({ type: ACTION_ADD });
}

function* asyncMinus() {
  // yield take(ASYNC_ACTION_MINUS);
  yield call(asyncafterSometimes);
  yield put({ type: ACTION_MINUS });
}

// root-saga 作为 watcher 存在
function* mySaga() {
  // take 只执行一次, 阻塞
  // yield take(ASYNC_ACTION_ADD);
  // console.log(1);
  // yield put({ type: ACTION_ADD });
  // yield take(ASYNC_ACTION_MINUS);
  // console.log(2);
  // yield put({ type: ACTION_MINUS });

  // takeEvery 每次都执行; takeLatest 每次都执行, 但只取最新的一次, 非阻塞
  yield takeEvery(ASYNC_ACTION_ADD, asyncAdd);
  console.log(1);
  yield takeLatest(ASYNC_ACTION_MINUS, asyncMinus);
  console.log(2);

  // watcher worker
  // console.log('before');
  // yield asyncAdd();
  // console.log(1);
  // yield asyncMinus();
  // console.log(2);
}

async function asyncafterSometimes(delay = 1000) {
  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  return delay;
}

export default mySaga;
