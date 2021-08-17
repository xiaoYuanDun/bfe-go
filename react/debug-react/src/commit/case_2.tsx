import React, { useEffect, useState, useLayoutEffect } from 'react';

// useEffect

function Show(props: any) {
  return <p>{props.num}</p>;
}

function App() {
  const [num, setNum] = useState(1);

  useEffect(() => {
    console.log('----====---->>');
    console.log('every time');
    return () => {
      console.log('every unmount');
    };
  });

  const [name, setName] = useState('xiaoMing');

  useEffect(() => {
    console.log('----====---->>');
    console.log('invoke once');
    return () => {
      console.log('---------------------------------------------FC unmount');
    };
  }, []);

  useLayoutEffect(() => {
    console.log('----====---->>');
    console.log('every useLayoutEffect');
    return () => {
      console.log('every layout unmount');
    };
  });

  const handleClick = () => {
    setNum(num + 1);
  };
  return (
    <div>
      <button onClick={handleClick}>click me</button>
      {num % 3 === 0 ? null : <Show num={num} />}
    </div>
  );
}

export default App;
