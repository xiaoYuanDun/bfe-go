import React from 'react';
import _ from 'lodash';

import './App.less';

const App = () => {
  console.log('hi.');
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
      this is app ...{_.get({ name: 'xiaoMing' }, 'name')}
    </div>
  );
};

export default App;
