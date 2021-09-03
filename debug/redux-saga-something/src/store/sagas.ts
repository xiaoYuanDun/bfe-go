import {
  call,
  put,
  take,
  takeEvery,
  takeLatest,
  fork,
} from 'redux-saga/effects';
// import { take, put } from '../../custom/effects';

async function asyncafterSometimes(delay = 1000) {
  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  return delay;
}

import {
  ACTION_MINUS,
  ACTION_ADD,
  ASYNC_ACTION_ADD,
  ASYNC_ACTION_MINUS,
} from './actions';

// 真正处理副作用的是这些 worker-saga
function* asyncAdd() {
  // yield call(asyncafterSometimes);
  yield take(ASYNC_ACTION_ADD);
  yield put({ type: ACTION_ADD });
}

function* asyncMinus() {
  // yield call(asyncafterSometimes);
  yield put({ type: ACTION_MINUS });
}

// root-saga 作为 watcher 存在
function* mySaga() {
  yield fork(asyncAdd);

  yield take(ASYNC_ACTION_MINUS);
  yield put({ type: ACTION_MINUS });

  // yield takeEvery(ASYNC_ACTION_ADD, asyncAdd);
  // yield takeEvery(ASYNC_ACTION_MINUS, asyncMinus);
  // yield take(ASYNC_ACTION_ADD);
  // yield put({ type: ACTION_ADD });
  // yield take(ASYNC_ACTION_MINUS);
  // yield put({ type: ACTION_MINUS });
}

export default mySaga;
