import { useEffect, useLayoutEffect, useRef } from 'react';

type effectHookType = typeof useEffect | typeof useLayoutEffect;

// TODO, 泛型函数需要手动收束类型，这里不用这种方式了
// type UpdateEffectType = <T extends effectHookType>(hook: T) => T;

/**
 * TODO, 泛型函数需要手动收束类型，这里不用这种方式了
 * type UpdateEffectType = <T extends effectHookType>(hook: T) => T;
 *
 * 发现这个 hook 和下面这种情况完美契合，假设我有这样一个需求：
 *   当某个组件需要通过一个 id（或其他任意参数），而这个 id 有不能马上得到（同步），那么此时我们需要在这个组件内判断
 *   id 为空时，不执行（其实这属于多余的执行）
 *   id 有值或变化时，才执行需要的回调
 *
 * 如果使用 useUpdateEffect 的话，正好可以解决这个问题，首次不管有没有 id 都不会执行，因为我们的需求是 id 是异步得到的
 * 所以一定会在未来的某个时间进行 re-render，这里监听了 id，正好可以出发其正确回调
 *
 * useUpdateEffect(() => {
 *   run(id);
 * }, [id]);
 *
 * 而如果首次渲染就需要 id，且 id 是同步的话，那就不需要 useUpdateEffect 了，使用普通的 useEffect 就行
 *
 * useEffect(() => {
 *   run(id);
 * }, [id]);
 *
 */
export const createUpdateEffect: (hooks: effectHookType) => effectHookType =
  (hook) => (effect, deps) => {
    const isMounted = useRef(false);

    // 这里是官方的实现，比自己多的地方，在每次组件销毁时，重置 isMounted ?
    // for react-refresh
    hook(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    hook(() => {
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        return effect();
      }
    }, deps);
  };

export default createUpdateEffect(useEffect);
