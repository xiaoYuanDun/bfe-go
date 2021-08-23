```js
createHashHistory;

window.addEventListener('popstate', handlePop);

window.addEventListener('hashchange', () => {
  let [, nextLocation] = getIndexAndLocation();
  // Ignore extraneous hashchange events.
  if (createPath(nextLocation) !== createPath(location)) {
    handlePop();
  }
});
```

```js
// history usage:
const history = createHashHistory();

const listener = (update) => {
  console.log(update);
};

history.listen(listener);
```

##### 内部监听 `popstate` 和 `hashchange`

原生 hash 只能通过 hashchange 方法监听 hash 变化, hash 没有自带的 push 方法, 这里添加了 `push`

有几种方式可以出发 hash 变化:

1. 直接修改 window.location.hash = ...
   window.location.hash --> 原生 hashchange.handler 捕获 --> 'handlePop' --> 'applyTx'(触发 listener)
2. histroy.push(...)
   histroy.push --> 原生.pushState --> 'applyTx'(触发 listener)

##### Route 渲染优先级: children > component > render, **注意, 若 children 是 function, 无论匹配与否, 都会渲染**

```js
// ... Route
return (
  <RouterContext.Provider value={props}>
    {props.match
      ? children
        ? typeof children === 'function'
          ? __DEV__
            ? evalChildrenDev(children, props, this.props.path)
            : children(props)
          : children
        : component
        ? React.createElement(component, props)
        : render
        ? render(props)
        : null
      : typeof children === 'function'
      ? __DEV__
        ? evalChildrenDev(children, props, this.props.path)
        : children(props)
      : null}
  </RouterContext.Provider>
);
```

##### 使用 `switch` 时, 内部会遍历 children, 并提前匹配每个 child, 如果匹配到, 赋值 element, matched, 交给下层 Route 渲染(这时下层 Route 无需自己计算 match)

```js
// ... Switch
const location = this.props.location || context.location;

let element, match;

// We use React.Children.forEach instead of React.Children.toArray().find()
// here because toArray adds keys to all child elements and we do not want
// to trigger an unmount/remount for two <Route>s that render the same
// component at different URLs.
React.Children.forEach(this.props.children, (child) => {
  if (match == null && React.isValidElement(child)) {
    element = child;

    const path = child.props.path || child.props.from;

    match = path
      ? matchPath(location.pathname, { ...child.props, path })
      : context.match;
  }
});

return match
  ? React.cloneElement(element, { location, computedMatch: match })
  : null;
```

遍历使用的是 `React.Children.forEach` 方法, `React.Children.forEach(this.props.children, callback)`, 之所以使用它是因为, 如果两个 url 都会渲染同一个 component, 那么在这两个 url 切换时, 这种方法不会触发该 component 的 unmount/remount 生命周期函数, 但是如果使用 `React.Children.toArray().find()` 来寻找匹配的 component, 那么等同于重新渲染该组件

##### `Redirect` 的本质就是在匹配到路径时, 调用 history.push(toPath) 方法, 只是源码里多做了一层 LifeCycle 包裹

##### `Link` 的本质也是 history.push, 只不过使用了自定义占位组件, 重写其 onclick 方法, 并默认加入 navigation(history.push) 方法

##### `withRouter` 的本质是一个高阶组件, 在 wrapper 层得到 context 的值, 然后处理为内层组件的 props, 这样可以使没有被 Route 等组件包裹的组件获得 history, location 等属性

实际上, 也可以直接使用一个不带 path 的 Route 包裹内层组件也可以实现(仅用到 Route 下发 history, location 的特性)

```js
withRouter(Component) => {
  const newComponent = (props) => {
    return (
      <Context.Consumer>
        {
          context => {
            return Component({...context, ...props})
          }
        }
      </Context.Consumer>
    )
  }
  return newComponent
}
```

##### prompt 本质是使用 history.block 特性, 他本身没有实际的 dom 结构, 是在 Prompt mount 时, 给 history.block 监听数组添加一个 block, history 在 popstate 时, 会检查是否存在 block, 其返回值决定了是否离开当前页面

##### react-router 的 hooks 其实就是把一些全局的 context, 使用 useContext 暴露出去, 比较简单
