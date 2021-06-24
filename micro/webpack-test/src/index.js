// import React from 'react';
// import { render } from 'react-dom';
// import App from './App';

// const ele = <App />;

// render(ele, document.getElementById('root'));

import str from './parse';

import name, { son } from './te';

const a = name + son;
console.log(a);
console.log(str);

import('./title').then((res) => {
  console.log(res.default);
});
