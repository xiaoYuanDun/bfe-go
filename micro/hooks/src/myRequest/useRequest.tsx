import useRequestImplement from './useRequestImplement';

import type { Options, Pulgin, Service } from './types';

/**
 * 1. 定义了简洁的核心抽象
 * 2. 通过插件系统组装和实现不同的功能
 * 3.
 */
function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
  plugins?: Pulgin<TData, TParams>[]
) {
  return useRequestImplement(service, options, [...(plugins || [])]);
}

export default useRequest;
