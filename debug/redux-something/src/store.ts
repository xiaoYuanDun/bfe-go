import { createStore, combineReducers } from 'redux';

const reducer_1 = (state = { number: 0 }, action: any) => {
  if (action.type === 'ADD') {
    return { ...state, number: state.number + 1 };
  }
  if (action.type === 'MINUS') {
    return { ...state, number: state.number - 1 };
  }
  return state;
};

const reducer_2 = (state = { name: 'none' }, action: any) => {
  if (action.type === 'XIAOMING') {
    return { ...state, name: 'XIAOMING' };
  }
  if (action.type === 'DANNY') {
    return { ...state, name: 'DANNY' };
  }
  return state;
};

const rootReducer = combineReducers({
  reducer_1,
  reducer_2,
});

const store = createStore(rootReducer);

export { store };
