import { createStore, applyMiddleware } from 'redux';
// import createSagaMiddleware from 'redux-saga';
import createSagaMiddleware from '../../custom';

import { reducer_1 } from './reducers';
import mySaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducer_1, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(mySaga);

export default store;
