import React, { useReducer, useState, useEffect } from 'react';

function reducer(prevState: number, action: any) {
  if (action === 'add') {
    return prevState + 1;
  }
  return prevState;
}

function CountHook() {
  // const [number, dispatch] = useReducer(reducer, 0);
  const [number, setNumber] = useState(0);

  const [name, setName] = useState('xiaoMing');

  // useEffect(() => {
  //   console.log('useEffect invoke.');
  //   return () => {
  //     console.log('callback.');
  //   };
  // });

  const handleClick = () => {
    //   setNumber(number + 1);
    setNumber(number + 1);
  };

  return (
    <div key="count-wrap">
      {number}
      {/* {[...Array(100000)].map((it) => (
        <div>123</div>
      ))} */}
      {/* <button key="button" onClick={() => dispatch('add')}> */}
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button key="button" onClick={handleClick}>
        click me ...
      </button>
    </div>
  );
}

export default CountHook;
