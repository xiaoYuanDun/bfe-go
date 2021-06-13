import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './Counter';
import CountHook from './CountHook';

const root = document.getElementById('root');

ReactDOM.render(<CountHook />, root);

// concurrent mode 需要使用测试版本
// yarn unlink react react-dom
// yarn install --force
// yarn add react@experimental react-dom@experimental

// ReactDOM.unstable_createRoot(document.getElementById('root')).render(
//   <CountHook />
// );
