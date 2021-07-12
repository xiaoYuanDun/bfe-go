import React, { FC } from 'react';
import Header from './Head';

const App: FC = () => {
  // const App = () => {
  console.log('hi...');
  const a: string = '22';
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
  return (
    <div className="app">
      <Header name="haha" />
      this is app ...
    </div>
  );
};

export default App;
