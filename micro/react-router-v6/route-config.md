### 这里看一下 `useRoute` 这个核心方法用到的配置对象是什么样的，还有这个配置对象是如何变化的，主要的流程和处理方法是什么

- 这里假设有下面这样一个路由配置

```js
<Routes>
  <Route path="/" element={<App />} />
  <Route path="parent" element={<Parent />}>
    <Route path="son1" element={<Son1 />} />
    <Route path="son2" element={<Son2 />} />
  </Route>
</Routes>
```

- 首先通过 `<Routes>` 的 `children` 得到一个原始配置对象，结构和 `children` 是一一对应的

```js
const routes = [
  {
    // config-App
    caseSensitive: undefined,
    element: { type: App, $$typeof: Symbol(react.element) /*...*/ },
    index: undefined,
    path: '/',
  },
  {
    // config-Parent
    caseSensitive: undefined,
    element: { type: Parent, $$typeof: Symbol(react.element) /*...*/ },
    index: undefined,
    path: 'parent',
    children: [
      {
        // config-Son1
        caseSensitive: undefined,
        element: { type: Son1, $$typeof: Symbol(react.element) /*...*/ },
        index: undefined,
        path: 'son1',
      },
      {
        // config-Son2
        caseSensitive: undefined,
        element: { type: Son2, $$typeof: Symbol(react.element) /*...*/ },
        index: undefined,
        path: 'son2',
      },
    ],
  },
];
```

- 通过 `flattenRoutes` 得到 `branches`，并经过 `rankRouteBranches` 原地排序。我们这里可以得到所有可能的路径组合情况，这里我们 **把一种路径组合称为一个 `branch`**，从例子可知，我们所配置的路由一共有 4 个不同的匹配情况，分别是：

1. `/parent/son1`
2. `/parent/son2`
3. `/parent`
4. `/`

```js
// 这里的 config-[Xxx] 就是上面的同名引用，篇幅大且重复，这里就直接使用引用名了
/**
 * 分析一个配置对象
 * {
 *   path: '/parent/son1',        // 通过层级配置拼接出来的，当前 branch 的实际待匹配路径
 *   score: 24,                   // 对 path 各部分进行权重打分，分越高，越能获得优先匹配的机会
 *   routeMeta: [{                // branch 中每一层的匹配情况
 *     caseSensitive: false,      // 大小写敏感
 *     childrenIndex: 1,          // 当前配置对象在原始配置对象中所在层级的下标
 *     relativePath: 'path',      // 通常是在 Route 中配置的 path 属性，嵌套的 Route 接拼接 path 时会依赖上层 path
 *     route: {...config-Parent}  // 对应上面的原始配置对象
 *   }, {
 *     ...maybe another meta      // 当出现 Route 嵌套时，一个 branch 会存在多个 mete 配置
 *   }]
 * }
 *
 *
 *
 */
const branches = [
  {
    path: '/parent/son1',
    score: 24,
    routesMeta: [
      {
        caseSensitive: false,
        childrenIndex: 1,
        relativePath: 'parent',
        route: {
          /* ...config-Parent */
        },
      },
      {
        caseSensitive: false,
        childrenIndex: 0,
        relativePath: 'son1',
        route: {
          /* ...config-Son1 */
        },
      },
    ],
  },
  {
    path: '/parent/son2',
    score: 24,
    routesMeta: [
      {
        caseSensitive: false,
        childrenIndex: 1,
        relativePath: 'parent',
        route: {
          /* ...config-Parent */
        },
      },
      {
        caseSensitive: false,
        childrenIndex: 1,
        relativePath: 'son2',
        route: {
          /* ...config-Son2 */
        },
      },
    ],
  },
  {
    path: '/parent',
    score: 13,
    routesMeta: [
      {
        caseSensitive: false,
        childrenIndex: 1,
        relativePath: '/',
        route: {
          /* ...config-Parent */
        },
      },
    ],
  },

  {
    path: '/',
    score: 4,
    routesMeta: [
      {
        caseSensitive: false,
        childrenIndex: 0,
        relativePath: '/',
        route: {
          /* ...config-App */
        },
      },
    ],
  },
];
```

- 拿到了所有可能的渲染分支（`branches`），接下来就要用当前地址栏的 pathname 来一一匹配这些 `branch` 了，代码中是这样的：

```js
// 由于 branches 已经根据权重降序进行了排序，所以这里依次遍历即可
// 匹配到第一个符合条件的分支就会跳出循环
// ....
let matches = null;
for (let i = 0; matches == null && i < branches.length; ++i) {
  matches = matchRouteBranch(branches[i], pathname);
}
return matches;
```

- 来看看 `matchRouteBranch` 方法，他主要是从 `branch` 中拿出 `routesMeta` 信息，然后对每一层 Route 配置进行匹配（通过遍历 routesMeta 数组，非嵌套的 Route，它的 routesMeta 是长度为 1 的数组），我们可以把需要被验证匹配的 pathname 分成 **已完成匹配的** 和 **等待进行匹配的** 两部分看待，这里拿 '/parent/son1' 来距离，当进行某些操作后，地址栏的 pathname 部分变化为 `'/parent/son1'`，这时，`'/parent/son1'` 全部属于 **等待进行匹配的** 的部分，在 `matchRoute` 中进行判断时，主要就是使用的就是 `meta.relativePath` 来构建正则，并使用这个正则匹配 `remainingPathname` 来验证匹配情况的，每遍历完一层且匹配正确，就更新 `matchedPathname`，表示这部分属于 **已完成匹配的** 部分，在遍历下一层时会从基准 pathname 中截掉 **已完成匹配的** 的部分，得到这次匹配真正需要的的 `remainingPathname`，可以看下面这张表找找规律。中间任何一层不匹配都会导致当前 `branch` 匹配失败，否则就更新 `matchedParams（路径中的动态存值属性，如 '/:id' 等）` ，最后遍历完所有 meta，返回最终的 `matches`

|                       | meta_0                      | meta_1           |
| --------------------- | --------------------------- | ---------------- |
| 地址栏 pathname       | `'/parent/son1'`            | `'/parent/son1'` |
| **matchedPathname**   | `''`                        | `'/parent'`      |
| **remainingPathname** | `'/parent/son1'`            | `'/son1'`        |
|                       |                             |                  |
| meta_relativePath     | `'parent'`                  | `'son1'`         |
| meta_actually_path    | `'/parent'`                 | `'/son1'`        |
| mete_regExp           | `/^\/parent(?:\b\|\/\|$)/i` | `/^\/son1\/*$/i` |

```js
function matchRouteBranch(branch, pathname) {
  let { routesMeta } = branch;
  let matchedParams = {}; // 路径匹配过程中产生的动态值，如 '/parent/:id/:name' 中的 id 和 name
  let matchedPathname = '/';
  let matches = [];

  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = // 截掉 '已完成匹配的' 的部分
      matchedPathname === '/'
        ? pathname
        : pathname.slice(matchedPathname.length) || '/';
    let match = matchPath(
      {
        path: meta.relativePath,
        caseSensitive: meta.caseSensitive,
        end,
      },
      remainingPathname
    );
    if (!match) return null; // 任何一层不匹配，就退出

    // 更新它，因为每层都可能存在动态值，且最终
    Object.assign(matchedParams, match.params);
    let route = meta.route;
    matches.push({
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: joinPaths([matchedPathname, match.pathnameBase]),
      route,
    });

    // 更新 '已完成匹配的' 的部分
    if (match.pathnameBase !== '/') {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
```

- 再返回 `matchRoutes` 方法，如果 pathname 存在对应的渲染路径（matches 有值），那么就把 `matches` 返回给 useRoute，这里的 `matches` 中包含了当前 pathname 对应的需要渲染的所有组件的信息，`_renderMatches` 会负责为 matches 链路上的所有组件添加正确的执行上下文并按父子顺序渲染它们

- 大体流程就是：`config --> flatten-branches --> rankbranches --> branch-meta-config --> validate-matches --> matches`

### todo

- \_renderMatches 核心
