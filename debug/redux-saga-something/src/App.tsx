import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ACTION_ADD,
  ACTION_MINUS,
  ASYNC_ACTION_ADD,
  ASYNC_ACTION_MINUS,
  CANCEL_ADD,
} from './store/actions';

const App: FC = () => {
  const number = useSelector((s: any) => s.number);
  const dispatch = useDispatch();

  return (
    <div>
      this is app ..., number: {number}
      <br />
      <button onClick={() => dispatch({ type: ACTION_ADD })}>add</button>
      <button onClick={() => dispatch({ type: ACTION_MINUS })}>minus</button>
      <br />
      <button onClick={() => dispatch({ type: ASYNC_ACTION_ADD })}>
        async add
      </button>
      <button onClick={() => dispatch({ type: ASYNC_ACTION_MINUS })}>
        async minus
      </button>
      <br />
      <button onClick={() => dispatch({ type: CANCEL_ADD })}>cancel</button>
    </div>
  );
};

export default App;
