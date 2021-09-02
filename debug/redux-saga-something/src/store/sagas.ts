// import { call, put, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { take, put } from '../../custom/effects';

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
  yield take(ASYNC_ACTION_ADD);
  yield put({ type: ACTION_MINUS });
  yield 3;
  yield 4;
  yield 5;
}

export default mySaga;
