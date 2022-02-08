import { useRef } from 'react';

import type { Pulgin } from '../types';

/**
 * fetch 基础实现不包含此功能，在这里通过插件实现
 *
 * 若异步方法在 delay 时间内返回，则不触发 loading，防止页面闪烁
 *
 * 1. 在请求开始前，启动时长为 delay 的定时器
 * 2. 若到定时器执行时，还没有返回值，这改变 loading 状态
 *
 */
const useLoadingDelayPlugin: Pulgin<any, any> = (
  fetchInstance,
  { loadingDelay }
) => {
  const timerRef = useRef<number>();

  // 不配置 delay 设置项，不做任何操作，直接返回
  if (!loadingDelay) {
    return {};
  }

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    onBefore: () => {
      cancelTimer();
      timerRef.current = window.setTimeout(() => {
        fetchInstance.setState({ loading: true });
      }, loadingDelay);
      return {
        loading: false,
      };
    },
    // 以下两种情况，表示请求结束，需要清除定时器
    onFinally: () => {
      cancelTimer();
    },
    onCancel: () => {
      cancelTimer();
    },
  };
};

export default useLoadingDelayPlugin;
