import {
  useCreation,
  useLatest,
  useUpdate,
  useMount,
  useUnmount,
  useMemoizedFn,
} from '../myHooks';
import Fetch from './Fetch';

import type { Service, Options, Pulgin, Result } from './types';

/**
 * 最终要返回数据实体，比如：loading，data 等
 */
function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Pulgin<TData, TParams>[] = []
) {
  const { manual = false, ...rest } = options;

  // 就是一个浅拷贝
  const fetchOptions = { manual, ...rest };

  // TODO，这里需要用 useLatest 吗？直接使用 service 不就可以保证每次都能拿到最新的 service
  const serviceRef = useLatest(service);

  // 一个强制刷新器
  const update = useUpdate();

  // 这是维护请求整个生命周期的数据变化的核心对象
  const fetchInstance = useCreation(() => {
    // TODO, 这个 initState 不太明了
    const initState = plugins
      .map((p) => p?.onInit?.(fetchOptions))
      .filter(Boolean);

    return new Fetch<TData, TParams>(
      serviceRef,
      fetchOptions,
      update
      //   { ...initState }
    );
  }, []);

  // 如果自动执行，这里就是执行时机，全生命周期只执行这一次，这里只负责调用一次，其他由 fetchInstance 实例接管
  useMount(() => {
    if (!manual) {
      // TODO, 默认参数的收集
      const params = (options.defaultParams || []) as TParams;
      fetchInstance.run(...params);
    }
  });

  // 有可能组件卸载时，异步请求还没有响应，这是需要取消请求
  useUnmount(() => {
    fetchInstance.cancel();
  });

  return {
    loading: fetchInstance.state.loading,
    data: fetchInstance.state.data,
    run: useMemoizedFn((fetchInstance.run as Function).bind(fetchInstance)),
    runAsync: useMemoizedFn(
      (fetchInstance.runAsync as Function).bind(fetchInstance)
    ),
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
  } as Result<TData, TParams>;
}

export default useRequestImplement;
