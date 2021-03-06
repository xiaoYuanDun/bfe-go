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

// import FC1 from './debug_01/FunctionComponent1';
// import CC1 from './debug_01/ClassComponent1';

// const element = (
//   <div key="div-1">
//     <span key="span-1">head...</span>
//     <FC1 key="fc-1" />
//     <CC1 key="cc-1" title="hhh" />
//   </div>
// );

// ReactDOM.render(element, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// DIFF 调试用例 ./diff

// import Root from './diff';
// import Root from './diff/case_1';
// import Root from './commit/case_1';
// import Root from './commit/case_2';

// const root = <Root />;
// ReactDOM.render(root, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// DIFF 调试用例2 ./diff_02

// import Root from './diff_02';

// const root = <Root />;
// ReactDOM.render(root, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// setState 同步异步 调试用例

// import T1 from './event_proxy';
// ReactDOM.render(<T1 />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 事件代理 同步异步 调试用例

// import E2 from './event_proxy/E2';
// ReactDOM.render(<E2 />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 错误边界

// import ErrorTest from './error_boundary ';
// import Boundary from './error_boundary /boundary';

// const ele = (
//   <Boundary>
//     <ErrorTest />
//   </Boundary>
// );
// ReactDOM.render(ele, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// FC 的函数式调用和组件式声明的区别，子组件的 hook 被提升到父组件的问题

// import FcTest from './fc_test';

// ReactDOM.render(<FcTest />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 测试同一个 context 的嵌套使用是的行为

// import ele from './context';

// ReactDOM.render(ele, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 测试 context 变更时的更新流程

// import ContextChange from './context/ContextChange';

// ReactDOM.render(<ContextChange />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 测试 concurrent 模式，F12 查看 task 分布情况

// import App from './concurrent';

// ReactDOM.createRoot(document.getElementById('root')).render(<App />);
// ReactDOM.render(<App />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 整体流程复盘
// import App from './work_flow';

// ReactDOM.render(<App />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// hook 流程复盘
import App from './hooks_flow';

ReactDOM.render(<App />, document.getElementById('root'));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
