import { useRef } from 'react';
import { useUpdateEffect } from '../../myHooks';

import type { Pulgin } from '../types';

// TODO, 待实现
import isDocumentVisible from 'ahooks/lib/useRequest/src/utils/isDocumentVisible';
import subscribeReVisible from 'ahooks/lib/useRequest/src/utils/subscribeReVisible';

/**
 * 轮询功能扩展，在每次请求结束时，启动一个新的定时请求
 *
 * TODO, 没有加离屏停止
 */
const usePollingPlugin: Pulgin<any, any> = (
  fetchInstance,
  { pollingInterval, pollingWhenHidden = true }
) => {
  const timerRef = useRef<number>(-1);
  const unsubscribeRef = useRef<() => void>();

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    unsubscribeRef.current?.();
  };

  // 若 pollingInterval 为 0，表示需要取消轮询，直接停止定时器即可
  // 如果只是改变轮询时间（不为 0），不作其他操作
  // 会等待上一次轮询时间到期，并在下一次轮巡时，更新轮询时间
  useUpdateEffect(() => {
    clearTimeout(timerRef.current);
    if (
      pollingInterval &&
      timerRef.current !== -1 &&
      (pollingWhenHidden || isDocumentVisible())
    ) {
      timerRef.current = window.setTimeout(() => {
        fetchInstance.refresh();
      }, pollingInterval);
    }
  }, [pollingInterval]);

  // 对于提前返回的逻辑，注意需要放在正确的位置，不要影响 hooks 顺序
  // 不配置 polling 设置项，不做任何操作，直接返回
  if (!pollingInterval) {
    return {};
  }

  return {
    // 开始一次新的请求前清除上一次的定时器
    onBefore: stopPolling,
    onFinally: () => {
      // TODO, 待实现
      if (!pollingWhenHidden && !isDocumentVisible()) {
        unsubscribeRef.current = subscribeReVisible(() => {
          fetchInstance.refresh();
        });
        return;
      }

      timerRef.current = window.setTimeout(() => {
        fetchInstance.refresh();
      }, pollingInterval);
    },
    onCancel: () => {
      stopPolling();
      // timerRef.current = -1;
    },
  };
};

export default usePollingPlugin;
