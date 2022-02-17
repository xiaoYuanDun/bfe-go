import useRequestImplement from './useRequestImplement';
import {
  useLoadingDelayPlugin,
  usePollingPlugin,
  useDebouncePlugin,
  useAutoRunPlugin,
} from './plugins';

import type { Options, Pulgin, Service } from './types';

/**
 * 1. 定义了简洁的核心抽象，从代码角度看没必要在这里多包一层，但这里的定义实际上是在第一时间给出这个 hooks 的大的实现方向
 * 2. 通过插件系统，组装、扩展和实现不同的功能
 * 3. 插件应该具有干预主流程的能力，主题逻辑在实现时应该预留这种能力
 *
 * 这里，impl 本体是提供在基本的功能实现，并且确保在正确的时机调用正确的生命周期钩子
 * 插件需要按照指定格式，围绕各种钩子实现自己的逻辑
 *
 * plugins 顺序对最终结果又影响，因为在 impl 中执行所有 plugins 后，会将结果合并，如果出现同名属性，则会被覆盖
 */
function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
  plugins?: Pulgin<TData, TParams>[]
) {
  return useRequestImplement(service, options, [
    ...(plugins || [
      useDebouncePlugin,
      useLoadingDelayPlugin,
      usePollingPlugin,
      useAutoRunPlugin,
    ]),
  ]);
}

export default useRequest;
