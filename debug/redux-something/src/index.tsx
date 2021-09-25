import React, { useReducer, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import App2 from './App2';
import { Provider } from './origin';
import { store } from './store';

const Root = () => {
  // const app1 = useMemo(() => <App />, [store.getState().reducer_1.number]);
  // const app2 = useMemo(() => <App2 />, [store.getState().reducer_2.name]);
  // return (
  //   <>
  //     {app1}
  //     {app2}
  //   </>
  // );
  return (
    <>
      <App />
      {/* <App2 /> */}
    </>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);

/**
 *
 * const useSelector = () => {
 *   const [, dispatch] = useReducer((s) => s + 1, 0);
 *   return dispatch;
 * };
 *
 * const App2 = () => {
 *   const dispatch = useSelector();
 *   console.log('render ...');
 *   return (
 *     <div>
 *       <button onClick={dispatch}>dispatch</button>
 *       123
 *     </div>
 *   );
 * };
 * react-redux 的数据流原理
 *
 * useSelector:
 * 内部使用一个无意义的 useReducer 作为强制刷新组件的方法(forceRender), 无意义 state + 1 导致 state 变化, 从而 re-render
 *
 * 从 ReduxReactContext 中取的全局的 store, 在 useLayoutEffect 中订阅 store.subscribe(forceRender)
 *
 * dispatch 派发的 action 改变了 state 后, 会触发所有订阅方法, 这时 forceRender 被触发, 实际上, forceRender 外层还有一层 equal 判断,
 * 默认是shallowEqual, 此对比方法可自定义(作为 useSelector 的第二个参数)
 *
 */
