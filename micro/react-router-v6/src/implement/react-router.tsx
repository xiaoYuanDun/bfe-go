import React, { createContext, useMemo, useContext, Fragment } from 'react';
import { Action as NavigationType, parsePath } from 'history';

import type { ReactElement, ReactNode } from 'react';
import type { History, Location } from 'history';

///////////////////////////////////////////////////////////////////////////////
// CONTEXT
///////////////////////////////////////////////////////////////////////////////

/**
 * 每个 history 实例都要实现 Navigator 接口
 *
 * TODO:
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */
export type Navigator = Pick<History, 'go' | 'push' | 'replace' | 'createHref'>;
interface NavigationContextObject {
  basename: string;
  navigator: Navigator;
  // static: boolean; TODO: 不知道做什么的
}
const NavigationContext = createContext<NavigationContextObject>(null!);

interface LocationContextObject {
  location: Location;
  navigationType: NavigationType;
}

const LocationContext = createContext<LocationContextObject>(null!);

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
  navigator: Navigator;
};

export function Router({
  children = null,
  navigationType = NavigationType.Pop,
  location: locationProp,
  basename: basenameProp = '/',
  navigator,
}: RouterProps): ReactElement | null {
  invariant(
    !useInRouterContext(),
    '你不能嵌套使用 <Router>，一个应用中最多有一个 <Router>'
  );

  const basename = normalizePathname(basenameProp);
  const navigationContext = useMemo(
    () => ({
      basename,
      navigator,
      // static: staticProp,  TODO: static 的作用
    }),
    [basename, navigator]
  );

  // location 有可能是一串原始的地址字符串，如：'/login?next=home#123', 这里把字符串转成一个对象形式的 location
  if (typeof locationProp === 'string') {
    locationProp = parsePath(locationProp);
  }

  let {
    pathname = '/',
    search = '',
    hash = '',
    state = null,
    key = 'default',
  } = locationProp;

  let location = React.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);

    if (trailingPathname == null) {
      return null;
    }

    return {
      pathname: trailingPathname,
      search,
      hash,
      state,
      key,
    };
  }, [basename, pathname, search, hash, state, key]);

  if (location == null) {
    return null;
  }

  // TODO: 为什么要分两个 context
  // 注意看，Router 本身并不会渲染任何内容
  // 可以把它理解为，给 children 提供一个数据源外壳
  // 在渲染 Router 时，会把一些基础数据初始化好，做一些必要的 memo，加入到不同的 context 中，提供给 children
  // children={children} 和 <xx>{children}</xx> 是一样的，不必纠结
  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider
        children={children}
        value={{ location, navigationType }}
      />
    </NavigationContext.Provider>
  );
}

/**
 * Route 组件的父容器，会渲染当前 location 最佳匹配度的 Route 组件
 *
 *
 */
export interface RoutesProps {
  children?: React.ReactNode;
  location?: Partial<Location> | string;
}

export function Routes({
  children,
  location,
}: RoutesProps): React.ReactElement | null {
  return useRoutes(createRoutesFromChildren(children), location);
}

/**
 * Route 本身并不做什么操作，我理解它更像是一个固定格式的 "slot"
 * 如果想要配置路由信息，就必要要按照 Route 指定的格式去传递参数
 * 一定程度上减少了错误的发生，并且内建了一些检验和报错提示，有 bug 时更容易定位问题
 *
 * 注意这里的实现，Route 没有任何 return，如果直接渲染会报错，奇技淫巧了属于是
 */
export interface PathRouteProps {
  caseSensitive?: boolean;
  children?: ReactNode;
  element?: ReactNode | null;
  index?: false;
  path: string;
}

export interface LayoutRouteProps {
  children?: ReactNode;
  element?: ReactNode | null;
}

export interface IndexRouteProps {
  element?: ReactNode | null;
  index: true;
}

export function Route(
  _props: PathRouteProps | LayoutRouteProps | IndexRouteProps
): ReactElement | null {
  invariant(
    false,
    '<Route> 组件只能作为 <Routes> 组件的 children 来使用，不要直接渲染它，请用 Routes 包裹 Route'
  );
}

/**
 * 这里是处理当前 location 是否有对应的组件需要渲染的核心方法
 *
 * 首先返回匹配到当前 location 的组件，如果 routes 是嵌套树结构（Route嵌套），还需要用正确的上下文来渲染剩下的组件
 * 因为多级嵌套时，路由匹配是一级一级向内的
 * 处于树中的组件，如果想渲染其子组件，必须使用 <Outlet> 组件作为子组件的渲染占位
 *
 * 关于这一点，官网有一句话是这么说的："The nested url segments map to nested component trees"
 *
 * @see https://reactrouter.com/docs/en/v6/api#useroutes
 */
export function useRoutes(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string
): ReactElement | null {
  // 一个使用前的存在性验证
  // This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  invariant(
    useInRouterContext(),
    `useRoutes() may be used only in the context of a <Router> component.`
  );

  let { matches: parentMatches } = React.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : '/';
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : '/';
  let parentRoute = routeMatch && routeMatch.route;

  if (__DEV__) {
    // You won't get a warning about 2 different <Routes> under a <Route>
    // without a trailing *, but this is a best-effort warning anyway since we
    // cannot even give the warning unless they land at the parent route.
    //
    // Example:
    //
    // <Routes>
    //   {/* This route path MUST end with /* because otherwise
    //       it will never match /blog/post/123 */}
    //   <Route path="blog" element={<Blog />} />
    //   <Route path="blog/feed" element={<BlogFeed />} />
    // </Routes>
    //
    // function Blog() {
    //   return (
    //     <Routes>
    //       <Route path="post/:id" element={<Post />} />
    //     </Routes>
    //   );
    // }
    let parentPath = (parentRoute && parentRoute.path) || '';
    warningOnce(
      parentPathname,
      !parentRoute || parentPath.endsWith('*'),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at ` +
        `"${parentPathname}" (under <Route path="${parentPath}">) but the ` +
        `parent route path has no trailing "*". This means if you navigate ` +
        `deeper, the parent won't match anymore and therefore the child ` +
        `routes will never render.\n\n` +
        `Please change the parent <Route path="${parentPath}"> to <Route ` +
        `path="${parentPath === '/' ? '*' : `${parentPath}/*`}">.`
    );
  }

  let locationFromContext = useLocation();

  let location;
  if (locationArg) {
    let parsedLocationArg =
      typeof locationArg === 'string' ? parsePath(locationArg) : locationArg;

    invariant(
      parentPathnameBase === '/' ||
        parsedLocationArg.pathname?.startsWith(parentPathnameBase),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, ` +
        `the location pathname must begin with the portion of the URL pathname that was ` +
        `matched by all parent routes. The current pathname base is "${parentPathnameBase}" ` +
        `but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    );

    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }

  let pathname = location.pathname || '/';
  let remainingPathname =
    parentPathnameBase === '/'
      ? pathname
      : pathname.slice(parentPathnameBase.length) || '/';
  let matches = matchRoutes(routes, { pathname: remainingPathname });

  if (__DEV__) {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );

    warning(
      matches == null ||
        matches[matches.length - 1].route.element !== undefined,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element. ` +
        `This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
    );
  }

  return _renderMatches(
    matches &&
      matches.map((match) =>
        Object.assign({}, match, {
          params: Object.assign({}, parentParams, match.params),
          pathname: joinPaths([parentPathnameBase, match.pathname]),
          pathnameBase:
            match.pathnameBase === '/'
              ? parentPathnameBase
              : joinPaths([parentPathnameBase, match.pathnameBase]),
        })
      ),
    parentMatches
  );
}

///////////////////////////////////////////////////////////////////////////////
// UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Routes 组件使用此方法
 * 通过它的 children 属性创建路由配置对象
 * children 一般是一个或一组 <Route> 组件，且只能是 Route 组件或 React.Fragment
 */
export function createRoutesFromChildren(children: ReactNode): RouteObject[] {
  let routes: RouteObject[] = [];

  React.Children.forEach(children, (element) => {
    // 空值组件或不合法组件会被忽略而不导致函数中断，这样我们可以更容易的在 Routes 行内对 Route 进行控制
    if (!React.isValidElement(element)) return;

    // React.Fragment 的写法会被打平
    if (element.type === Fragment) {
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children)
      );
      return;
    }

    // children 只能是 Route
    invariant(
      element.type === Route,
      `[${
        typeof element.type === 'string' ? element.type : element.type.name
      }] 不是 <Route> 组件，<Routes> 组件的 children 只能是 <Route> 或者 <React.Fragment>`
    );

    let route: RouteObject = {
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      index: element.props.index,
      path: element.props.path,
    };

    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children);
    }

    routes.push(route);
  });

  return routes;
}

type RouteObject = {
  caseSensitive?: boolean;
  children?: RouteObject[];
  element?: React.ReactNode;
  index?: boolean;
  path?: string;
};

/**
 * 剔除字符串头尾的字符串，保证：
 *   1. 头部有且必定只有一个 '/'
 *   2. 尾部没有 '/'
 * 如，'///a/b/c///' 会被解析为 '/a/b/c'
 */
const normalizePathname = (pathname: string): string =>
  pathname.replace(/\/+$/, '').replace(/^\/*/, '/');

/**
 * 从 pathname 中去掉 basename 前缀（若 basename 存在）
 * 如 basename = '/prev', pathname = '/prev/sub'，则得到 '/sub'
 */
const stripBasename = (pathname: string, basename: string): string | null => {
  if (basename === '/') return pathname;

  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }

  let nextChar = pathname.charAt(basename.length);
  if (nextChar && nextChar !== '/') {
    // pathname does not start with basename/
    return null;
  }

  return pathname.slice(basename.length) || '/';
};

/**
 * 报错提示，提供 cond 和报错 message
 * 当 cond 为 false 时报错
 */
function invariant(cond: any, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

/**
 * 如过组件处于 <Router> 组件的子孙结构树中，返回 true
 * 判断依据是，是否存在 LocationContext 上下文，因为 Router 组件提供了它，如果一个组件在其作用范围内，则可以正确取值
 */
export function useInRouterContext(): boolean {
  return useContext(LocationContext) != null;
}
