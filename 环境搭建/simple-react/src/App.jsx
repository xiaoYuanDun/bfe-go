import React from 'react';

const App = () => {
  console.log('hi...');
  const test = async () => {
    console.log('start');
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    console.log('1');
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    console.log('2');
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    console.log('3');
  };
  test();
  return <div className="app">this is app ...</div>;
};

export default App;
