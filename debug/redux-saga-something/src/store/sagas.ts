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
import {
  take,
  put,
  fork,
  delay,
  takeEvery,
  takeLatest,
} from '../../custom/effects';

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
  yield delay(1000);
  yield put({ type: ACTION_ADD });
}

function* asyncMinus() {
  // yield take(ASYNC_ACTION_MINUS);
  yield fork(subMinus);
  yield delay(1000);
  yield put({ type: ACTION_MINUS });
}

function* subMinus() {
  yield delay(1000);
  yield put({ type: ACTION_MINUS });
}

// root-saga 作为 watcher 存在
function* mySaga() {
  // yield takeEvery(ASYNC_ACTION_ADD, asyncAdd);
  yield takeLatest(ASYNC_ACTION_MINUS, asyncMinus);
}

export default mySaga;
