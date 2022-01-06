import React, { createContext, useMemo } from 'react';
import { Action as NavigationType } from './history';

import type { ReactElement, ReactNode } from 'react';

// 全局的 Navigation 上下文
interface NavigationContextObject {
  basename: string;
  navigator: Navigator;
  static: boolean;
}
const NavigationContext = createContext<NavigationContextObject>(null!);

/**
 * 提供 location 上下文
 *
 * 注意：通常不需要直接渲染一个 <Router>，相反，应该根据你的环境
 * 渲染一个更加具体的 <Router> 实现，如在浏览器环境下的 <BrowserRouter>，
 * 服务器端的 <StaticRouter>
 */
type RouterProps = {
  children?: ReactNode;
  location: Partial<Location> | string;
  navigationType?: NavigationType;
  basename?: string;
};
export function Router({
  children = null,
  navigationType = NavigationType.Pop,
  location: locationProp,
  basename: basenameProp = '/',
}: RouterProps): ReactElement | null {
  let navigationContext = useMemo(() => {});

  return (
    <NavigationContext.Provider value={{}}>123</NavigationContext.Provider>
  );
}
