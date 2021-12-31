import React, { useRef, useState, useLayoutEffect } from 'react';
import { createBrowserHistory } from 'history';
import { Router } from './react-router';

import type { ReactNode } from 'react';
import type { BrowserHistory } from 'history';

// 在浏览器环境下的一个 <Router> 容器，提供最简洁的 URLS
type BrowserRouterProps = {
  children?: ReactNode;
  // basename?: string;
  window?: Window;
};
export function BrowserRouter({ children, basename }: BrowserRouterProps) {
  const historyRef = useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  const history = historyRef.current!;
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  // TODO ???
  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      children={children}
      // basename={basename}
      // location={state.location}
      // navigationType={state.action}
      // navigator={history}
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
