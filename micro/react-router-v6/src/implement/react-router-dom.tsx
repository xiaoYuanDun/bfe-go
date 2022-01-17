import React, { useRef, useState, useLayoutEffect } from 'react';
import { createBrowserHistory } from 'history';
import { Router } from './react-router';

import type { ReactNode } from 'react';
import type { BrowserHistory, Action } from './history';

////////////////////////////////////////////////////////////////////////////////
// BROWSER-ROUTER
//
// 在浏览器环境下的一个 <Router> 容器
////////////////////////////////////////////////////////////////////////////////

type BrowserRouterProps = {
  children?: ReactNode;
  /**
   * 可以理解为一个全局的路由根路径，如果设置了 basename，会在所有匹配路径前加上 basename 前缀
   * browser-router 默认为 '/'
   */
  basename?: string;
  // window?: Window;
};
export function BrowserRouter({ children, basename }: BrowserRouterProps) {
  const historyRef = useRef<BrowserHistory>();
  if (historyRef.current == null) {
    // TODO: 实现 history 后使用自己的 createBrowserHistory
    historyRef.current = createBrowserHistory({ window }) as BrowserHistory;
  }

  const history = historyRef.current!;
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  /**
   * TODO:
   * 暂时只需要知道，history 会在地址栏变化是触发回调，更新 action 和 location
   * 而 history.listen 的回调是一个销毁当前监听函数的函数
   */
  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      children={children}
      navigationType={state.action}
      location={state.location}
      basename={basename}
      navigator={history}
    />
  );
}

/**
 * 在浏览器环境下的一个 <Router> 容器
 * 在URL的hash部分存储loaction信息（'#'之后）
 * URL的hash部分的变化不会被发送请求到服务器
 */
type HashRouterProps = {};
export function HashRouter({}: HashRouterProps) {}
