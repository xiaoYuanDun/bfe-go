import { useEffect, useRef } from 'react';
import type { DependencyList } from 'react';

// 和 ===，== 的行为不同，具体看这里
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function depsAreSame(oldDeps: DependencyList, deps: DependencyList): boolean {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
}

/**
 * 内部使用了 useRef，而非 useMemo，因为 useMemo 不提供语义上的优化保证（有可能出现意料之外的重计算）
 */
function useCreation<T>(factory: () => T, deps: DependencyList) {
  const { current } = useRef({
    initialized: false,
    data: undefined as T | undefined,
    deps,
  });

  // 有两种情况会导致重新进行初始化赋值
  // 1. 如果没有初始化，那么就初始化一次，并且修改初始化标量为 true
  // 2. 对新旧 deps 比较，如果 deps 发生变化，如新初始化一次
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.data = factory();
    current.initialized = true;
    current.deps = deps;
  }
  return current.data as T;
}

export default useCreation;
