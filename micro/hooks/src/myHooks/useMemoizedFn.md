### 1. `useMemoizedFn` 解决了什么问题?

- 先来简单看一下它的用法
  ```js
  const [name, setName] = useState('xiaoMing')
  const [age, seAge] = useState(20)

  // useCallback
  const memoFn = useCallback(() => {
    console.log('name', name, 'age', age)
  }, [name, age])

  // useMemoizedFn
  const memoFn = useMemoizedFn(() => {
    console.log('name', name, 'age', age)
  })
  ```

- 它的功能和 useCallback 类似，不过使用更简单，不需要提供 `dep` 数组

- 解决了由 hook 中的 `dep` 引起的闭包问题，同时保证了函数调用的准确性，实时性

### 2. 如何实现?

- 我们首先来考虑一下下面这种情况:
  ```js
  const callbackFn = useCallback(() => {
    console.log(`Current count is ${count}`);
  }, [count]);
 
  <ExpensiveTree showCount={memoizedFn} />
  ```
  在一个组件中，callbackFn 的 `dep` 必须包含 count，保证它被调用时能输出正确的 count，而不是错误的闭包值。但是这样的话，每次 count 发生变化是，callbackFn 本身的引用会变化，会触发依赖 callbackFn 的 ExpensiveTree 组件 re-render。在 ExpensiveTree 角度来看，其实这是一次多余的 render
 
- 实际上，如果我们找到一种方法解决上面所说的问题，就实现了 `useMemoizedFn` 这个 hook，我们来看看需要解决的问题有哪些
  1. callbackFn 的地址不能随 render 改变

  1. 要同时保证 count 的实时更新
  2. 并且 callbackFn 的引用地址不能变
  3. 不需要添加 dep 依赖

  接下来开始解决这些问题，如下
  ```js
  function useMemoizedFn(...args) {

    // 这里可以拿到每次最新的 fn，并把它更新到 ref 中，这可以保证此 ref 能够持有最新的 fn 引用
    const latestFn = useRef(fn);
    latestFn.current = fn;

    // 我们通过这个只初始化一次的 useRef 来构建一个函数调用外壳，保证这个外壳函数的引用不会发生变化
    // 并且通过在内部持有最新函数的引用，来保证调用准确性
    const memoizedFn = useRef((...args) => {
      latestFn.current?.(...args);
    });

    return memoizedFn.current;
  }
  ```

- 到这里，我们已经实现了 `useMemoizedFn` 的所有功能，简单来说，这个 hook 做的事情就是实时的维护函数的最新引用，并在适当的时候通过一个包装函数来调用它

### 3. 一些题外话

- 为什么 `useCallback` 在使用时，不更新 `dep`，函数体内拿到的就是旧数据呢？
  
  这其实可以从 `useCallback` 源码中找到答案
  ```js
  function mountCallback(callback, deps) {
    var hook = mountWorkInProgressHook();
    var nextDeps = deps === undefined ? null : deps;
    hook.memoizedState = [callback, nextDeps];
    return callback;
  }
  ```
  可以看到，`useCallback` 在初始化时，调用的是 `mountCallback`，创建了一个新的 hook，并把 原始 callback 和 dep 存储在当前 hook 的 memoizedState 上

  再来看一下 `useCallback` 更新时做了什么
  ```js
  function updateCallback(callback, deps) {
    var hook = updateWorkInProgressHook();
    var nextDeps = deps === undefined ? null : deps;
    var prevState = hook.memoizedState;
    
    if (prevState !== null) {
      if (nextDeps !== null) {
        var prevDeps = prevState[1];

        // 新旧 dep 无变化，使用旧函数
        if (areHookInputsEqual(nextDeps, prevDeps)) {
          return prevState[0];
        }
      }
    }

    // 否则，返回最新值
    hook.memoizedState = [callback, nextDeps];
    return callback;
  }
  ```
  可以看到，这里获取当上次存储的 callback 和 dep，用旧的 dep 和最新的 dep 做一个浅比较。如果 dep 不同就用最新的 callback 和 dep 替换 memoizedState，并返回。否则，就返回旧的 callback

  那么在观察 `useCallback` 的使用方式: `useCallback(() => { ... }, [...])`

  我们在 mountCallback 或 updateCallback 拿到的 callback 就是这个包含了当时上下文环境的箭头函数。在 dep 发生变化时，我们其实是用一个新的箭头函数来替换旧的箭头函数，而新的箭头函数中又持有着最新的数据引用，这就导致了如果没有及时更新函数引用，就会在调用时拿到旧的箭头函数引用，而旧的箭头函数持有的是旧的数据引用，从而拿到错误的过期数据

  实际上，在组件每次 render 时，被 useCallback 包裹的函数都会重新创建，只不过 useCallback 内部决定了是否使用这个最新的函数

