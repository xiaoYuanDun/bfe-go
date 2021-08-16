import React, { useEffect, useState, useLayoutEffect } from 'react';

// useEffect

function App() {
  const [name, setName] = useState('xiaoMing');

  useEffect(() => {
    console.log('----====---->>');
    console.log('every time');
    return () => {
      console.log('every unmount');
    };
  });

  useEffect(() => {
    console.log('----====---->>');
    console.log('invoke once');
  }, []);

  useLayoutEffect(() => {
    console.log('----====---->>');
    console.log('every useLayoutEffect');
    return () => {
      console.log('every useLayoutEffect');
    };
  });

  const handleClick = () => {
    setName(name === 'xiaoHong' ? 'danny' : 'xiaoHong');
  };
  return (
    <div>
      <button onClick={handleClick}>click me</button>
      <p>{name}</p>
    </div>
  );
}

export default App;
