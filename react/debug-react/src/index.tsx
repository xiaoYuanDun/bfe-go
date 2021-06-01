import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// const ele = <App />;
const ele = (
  <div id="A1">
    A1
    <div id="B1">B1</div>
    <div id="B2">
      B2
      <div id="C1">C1</div>
      <div id="C2">C2</div>
    </div>
    {/* {[...Array(10000)].map((it, i) => (
      <div id={`${i}`}>{i}</div>
    ))} */}
  </div>
);
console.log('ele', ele);

ReactDOM.render(ele, document.getElementById('root'));
// ReactDOM.unstable_createRoot(document.getElementById('root')).render(ele);
