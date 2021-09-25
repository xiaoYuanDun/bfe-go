import { ACTION_ADD, ACTION_MINUS } from './actions';

const reducer_1 = (preState = { number: 0 }, action: any) => {
  if (action.type === ACTION_ADD) {
    return { ...preState, number: preState.number + 1 };
  }
  if (action.type === ACTION_MINUS) {
    return { ...preState, number: preState.number - 1 };
  }
  return preState;
};

export { reducer_1 };
