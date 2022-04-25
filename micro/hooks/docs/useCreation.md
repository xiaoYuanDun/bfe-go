### 1. `useCreation` 解决了什么问题?

- 简单看一下它的用法
  ```js
    const [name, setName] = useState('xiao Hong')

    // useMemo
    const firstChar = useMemo(() => {
      return { 
        first: name.charAt(0)
      }
    }, [name])

    // useCreation
    const firstChar = useCreation(() => {
      return {
        first: name.charAt(0)
      }
    }, [name])
  ```

- 可以看到和 `useMemo` 完全一致，但是 `useCreation` 内部使用了 `useRef` 来维护工厂函数产生的变量，保证了缓存变量不会被意外回收。它可以看成是 `useMemo` 的优化版本，因为官方表示，useMemo 持有的变量并不能保证一定不会被回收，具体可以看 [ahooks官方文档](https://ahooks-next.surge.sh/zh-CN/hooks/use-creation) 或 [react官方文档](https://zh-hans.reactjs.org/docs/hooks-reference.html#usememo)

### 2. 如何实现?

- 首先考虑在 react 中有什么办法可以持久化一个变量，而且不用担心意外的变量回收？答案是，`useRef`，它本身的逻辑就是分配一个脱离 react 声明周期的对象，并在 mount 时初始化一次，之后通过 current 指针来修改或使用。所以 `useCreation` 的核心依赖就是 `useRef`

  ```js
  function useCreation(factory, deps) {
    // 在这里构建一个基础对象，来维护初始化参数
    const { current } = useRef({
      initialized: false,
      data: undefined,
      deps
    })

    // 有两种情况会导致重新进行初始化赋值
    // 1. 如果没有初始化，那么就初始化一次，并且修改初始化标量为 true
    // 2. 对新旧 deps 比较，如果 deps 发生变化，如新初始化一次
    if (!current.initialized || !depsAreSame(current.deps, deps)) {
      current.data = factory();
      current.initialized = true;
      current.deps = deps;
    }
    return current.data 
  }

  // 这里的对比方法其实还有很多不同实现，这里以官方方法为准
  function depsAreSame(oldDeps, deps) {
    if (oldDeps === deps) return true;
    for (let i = 0; i < oldDeps.length; i++) {
      // 和 ===，== 的行为不同，具体看这里
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is
      if (!Object.is(oldDeps[i], deps[i])) return false;
    }
    return true;
  } 
  ```

### 3. 一些题外话

- 个人认为，在大多数情况下，使用优化手段前(如 `useMemo`, `memo` 等方法)，应该充分考虑是否真的需要进行优化。往往一次缓存优化的性能代价比重新计算或渲染一次，更耗时。

- 如 memo 的对比函数 `memo((prev, next) => true/false)` 中，如果对比计算比较复杂，可能计算逻辑的耗时比组件的一次 re-render 更高

- 又比如 useMemo 中，我们也要搞清楚我们优化的目的是什么？是为了避免一次耗时计算，还是仅仅为了保持变量引用不变。如果是后者，完全可以用 `useRef` 去代替。
  ```js
  const memo_0 = useMemo(() => { 
    const data = someExpensiveCalc()
    return data
  }, [])
 
  // 为了保持引用一致而使用 useMemo
  const memo_1 = useMemo(() => referenceObj, [])

  // 代替方案
  const memo_2 = useRef(referenceObj)
  ```
- 但是这里有个问题，如果上面的 `referenceObj` 是这种形式：`useRef(new Xxx())`。
  那么，每次 re-render 都会实例化一个 Xxx 的新对象，虽然这个新对象不会被更新到 useRef.current 上，但构造函数每次都被重复的执行了。这个问题该如何解决呢？如何更精确的控制 Xxx 的执行时机？
  
- `useCreation` 通过构建工厂方法，实现了 **延迟执行** 的特性（在必要时执行工厂方法，构造对象）

- 其实可以看一下 `useRef` 的源码，会对它所做的工作有个更清晰的认识，代码量很小
  ```js  
  function mountRef(initialValue) {
    var hook = mountWorkInProgressHook();

    // 很简单的初始化操作，构建一个 { current } 对象
    const ref = {
      current: initialValue
    }
    hook.memoizedState = ref
    return ref
  }

  // 可以看到 useRef 的更新过程中，参数 initialValue 是没有被用到的
  function updateRef(initialValue) {
    var hook = updateWorkInProgressHook();
    return hook.memoizedState
  }
  ```
  所以，initialValue 只在 `useRef` 初始化时生效，并且可以随时通过 ref.current 来修改


- `useMemo` 
  ```js
  // 很清晰的初始化逻辑，创建 hook，创建初始值，挂在初始值，返回初始值
  function mountMemo(nextCreate, deps) {
    var hook = mountWorkInProgressHook();
    var nextDeps = deps === undefined ? null : deps;
    var nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }

  function updateMemo(nextCreate, deps) {
    var hook = updateWorkInProgressHook();
    var nextDeps = deps === undefined ? null : deps;
    var prevState = hook.memoizedState;

    // 存在缓存对象，并且前后 deps 相同时，使用旧对象
    if (prevState !== null && nextDeps !== null) {
      var prevDeps = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }

    // 否则通过 factory 函数(这里的 nextCreate)产生新的对象，并且和 nextDeps 一起，构造新的 memoizedState
    var nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }
  ```
- 在了解了两个 `hook` 的代码逻辑后，就可以比较轻松的组合出自己的 `useCreation` 了。

 