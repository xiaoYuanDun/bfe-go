import React, { FC } from 'react';
import ReactDOM from 'react-dom';

/**
 * concurrent mode 调试须知:
 *
 * 需要使用测试版本
 * yarn unlink react react-dom
 * yarn install --force
 * yarn add react@experimental react-dom@experimental
 * ReactDOM.unstable_createRoot(document.getElementById('root')).render(<Xxx />)
 */

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// Counter 计数用例, ./counter

// import Counter from './counter/Counter';
// import CountHook from './counter/CountHook';

// const root = document.getElementById('root');
// ReactDOM.render(<CountHook />, root);

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// React.createElement, ReactDOM.render 调试用例, ./debug_01

import FC1 from './debug_01/FunctionComponent1';
import CC1 from './debug_01/ClassComponent1';

const element = (
  <div key="div-1">
    <span key="span-1">head...</span>
    <FC1 key="fc-1" />
    <CC1 key="cc-1" title="hhh" />
  </div>
);

ReactDOM.render(element, document.getElementById('root'));
