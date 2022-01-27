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
 */
function __useMemoizedFn<T extends (...args: any[]) => any>(fn: T) {
  // const func = () => {
  //     console.log(`Current count is ${count}`);
  //   }
  //   const callbackFn = useCallback(func, [func]);

  //   const ref = useRef<Function>();
  //   if (!ref.current) {
  //     ref.current = function () {
  //       callbackFn.apply(this);
  //     };
  //   }

  //   return ref.current;

  console.log('...');
  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef<T>();
  if (!memoizedFn.current) {
    // memoizedFn.current = function (...args) {
    //   console.log('===', this);
    //   return fnRef.current.apply(null, args);
    // } as T;
    memoizedFn.current = () => fnRef.current();
  }

  return memoizedFn.current;
}

export default __useMemoizedFn;
