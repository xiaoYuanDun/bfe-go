import { useRef, useCallback, useMemo } from 'react';

/**
 * 考虑下面这种情况，
 *
 * const callbackFn = useCallback(() => {
 *   console.log(`Current count is ${count}`);
 * }, [count]);
 *
 * <ExpensiveTree showCount={memoizedFn} />
 *
 * callbackFn 的 dep 必须执行 count，保证它被调用是能输出正确的 count，而不是错误的闭包值
 * 但是这样的话，callbackFn 本身的引用会变化，依赖 callbackFn 的组件会 re-render
 *
 * 有什么方法可以解决这个问题吗？
 *   1. 要同时保证 count 的实时更新
 *   2. 并且 callbackFn 的引用地址不能变
 *   3. 不需要添加 dep 依赖
 *
 * 下面是自己的实现，和官方的实现区别不大，不过在这里有点出入：
 * 自己的: fnRef.current = fn;
 * 官方的: fnRef.current = useMemo(() => fn, [fn]);
 * 具体原因可以看这个 issue https://github.com/alibaba/hooks/issues/728，这里不深究了
 */
function useMemoizedFn<T extends (...args: any[]) => any>(fn: T) {
  // 这里可以拿到每次最新的 fn，把他们更新到 ref 中
  const fnRef = useRef(fn);
  fnRef.current = fn;

  // 这里只是给一个假的调用外壳，只初始化一次，实际调用的是每次最新的 fn
  const memoizedFn = useRef(() => {
    fnRef.current?.();
  });

  return memoizedFn.current;
}

export default useMemoizedFn;

/**
 * 插一个题外话，为什么不更新 dep，函数拿到的就是旧数据呢，我们看一下 useCallback 的源码
 *
 * 这里创建了一个新的 hook，并把 原始callback 和 dep 存储在当前 hook 的 memoizedState 上
 * ---
 * function mountCallback(callback, deps) {
 *   var hook = mountWorkInProgressHook();
 *   var nextDeps = deps === undefined ? null : deps;
 *   hook.memoizedState = [callback, nextDeps];
 *   return callback;
 * }
 *
 *
 * 这里获取当上次存储的 callback 和 dep，用旧的 dep 和最新的 dep 做一个浅比较
 * 如果 dep 不同就用最新的 callback 和 dep 替换 memoizedState，并返回
 * 否则，就返回旧的 callback
 * ---
 * function updateCallback(callback, deps) {
 *   var hook = updateWorkInProgressHook();
 *   var nextDeps = deps === undefined ? null : deps;
 *   var prevState = hook.memoizedState;
 *
 *   if (prevState !== null) {
 *     if (nextDeps !== null) {
 *       var prevDeps = prevState[1];
 *
 *       if (areHookInputsEqual(nextDeps, prevDeps)) {
 *         return prevState[0];
 *       }
 *     }
 *   }
 *   hook.memoizedState = [callback, nextDeps];
 *   return callback;
 * }
 *
 * 观察 useCallback 使用方式：
 * useCallback(() => { ..... }, [...])
 *
 * 我们在 mountCallback 或 updateCallback 拿到的 callback 就是 () => {...}
 * 是一个包含了当时上下文环境的箭头函数，在 dep 发生变化时，我们其实是用一个新的箭头函数来替换旧的，
 * 而新的箭头函数中又保存了最新的数据（因为每次 render 都会使用最新的数据重新创建一个箭头函数）
 *
 * 实际上，不管我们是否使用 useCallback，在每次组件 render 时，
 * 被它包裹的函数都会重新创建，只不过 useCallback 会决定是否使用这个最新的函数
 */

// --------- 可以用下面的用例来测试他们的表现
//  const Example = () => {
//   const [count, setCount] = useState(0);

//   const callbackFn = useCallback(() => {
//     console.log(`Current count is ${count}`);
//   }, [count]);

//   const memoizedFn = useMemoizedFn(() => {
//     console.log(`Current count is ${count}`);
//   });

//   return (
//     <>
//       <p>count: {count}</p>
//       <button
//         type="button"
//         onClick={() => {
//           setCount((c) => c + 1);
//         }}
//       >
//         Add Count
//       </button>

//       <p>
//         You can click the button to see the number of sub-component renderings
//       </p>

//       <div style={{ marginTop: 32 }}>
//         <h3>Component with useCallback function:</h3>
//         {/* use callback function, ExpensiveTree component will re-render on state change */}
//         <ExpensiveTree showCount={callbackFn} />
//       </div>

//       <div style={{ marginTop: 32 }}>
//         <h3>Component with useMemoizedFn function:</h3>
//         {/* use memoized function, ExpensiveTree component will only render once */}
//         <ExpensiveTree showCount={memoizedFn} />
//       </div>
//     </>
//   );
// };
