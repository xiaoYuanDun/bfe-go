import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  ACTION_MINUS,
  ACTION_ADD,
  ASYNC_ACTION_ADD,
  ASYNC_ACTION_MINUS,
} from './actions';

// 真正处理副作用的是这些 worker-saga
function* asyncAdd() {
  yield call(asyncafterSometimes);
  yield put({ type: ACTION_ADD });
}

function* asyncMinus() {
  yield call(asyncafterSometimes);
  yield put({ type: ACTION_MINUS });
}

// root-saga 作为 watcher 存在
function* mySaga() {
  yield takeEvery(ASYNC_ACTION_ADD, asyncAdd);
  yield takeLatest(ASYNC_ACTION_MINUS, asyncMinus);
}

async function asyncafterSometimes(delay = 1000) {
  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  return delay;
}

export default mySaga;
