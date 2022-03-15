import React, { useReducer, useState, useEffect } from 'react';

function reducer(prevState: number, action: any) {
  if (action === 'add') {
    return prevState + 1;
  }
  return prevState;
}

function CountHook() {
  const [redu, dispatch] = useReducer(reducer, 0);

  const [number, setNumber] = useState(0);

  const [name, setName] = useState('xiaoMing');

  useEffect(() => {
    console.log('useEffect invoke.');
    return () => {
      console.log('callback.');
    };
  });

  const handleClick = () => {
    //   setNumber(number + 1);
    setNumber(number + 1);
  };

  return <div key="content-wrap">hooks flow</div>;
}

export default CountHook;
