import React, { useReducer } from 'react';

function reducer(prevState: number, action: any) {
  if (action === 'add') {
    return prevState + 1;
  }
  return prevState;
}

function CountHook() {
  const [number, dispatch] = useReducer(reducer, 0);

  return (
    <div key="count-wrap">
      <p key="p">{number}</p>

      {/* {[...Array(100000)].map((it) => (
        <div>123</div>
      ))} */}
      <button key="button" onClick={() => dispatch('add')}>
        click me ...
      </button>
    </div>
  );
}

export default CountHook;
