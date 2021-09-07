// import {
//   call,
//   put,
//   take,
//   takeEvery,
//   takeLatest,
//   fork,
//   actionChannel,
//   delay,
// } from 'redux-saga/effects';
import { take, put, fork } from '../../custom/effects';
import { takeEvery } from '../../custom/io-helpers';

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
  // yield call(asyncafterSometimes);
  yield put({ type: ACTION_ADD });
}

function* asyncMinus() {
  // yield take(ASYNC_ACTION_MINUS);
  // yield call(asyncafterSometimes);
  yield put({ type: ACTION_MINUS });
}

function* foo() {
  while (1) {
    console.log(1);
    yield take(ASYNC_ACTION_ADD);
    yield put({ type: ACTION_ADD });
  }
}

// root-saga 作为 watcher 存在
function* mySaga() {
  yield takeEvery(ASYNC_ACTION_ADD, asyncAdd);
  // yield takeEvery(ASYNC_ACTION_MINUS, asyncMinus);
}

export default mySaga;
