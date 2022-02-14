import { useRef } from 'react';
import { useUpdateEffect } from '../../myHooks';

import type { Pulgin } from '../types';

/**
 * 轮询功能扩展，在每次请求结束时，启动一个新的定时请求
 *
 * TODO, 没有加离屏停止
 */
const usePollingPlugin: Pulgin<any, any> = (
  fetchInstance,
  { pollingInterval }
) => {
  const timerRef = useRef<number>();

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // 若 pollingInterval 为 0，表示需要取消轮询，直接停止定时器即可
  // 如果只是改变轮询时间（不为 0），不作其他操作
  // 会等待上一次轮询时间到期，并在下一次轮巡时，更新轮询时间
  useUpdateEffect(() => {
    // if (!pollingInterval) {
    //   stopPolling();
    // }
    // TODO，立即停止当前轮询，并应用最新时间开启一次轮询
    stopPolling();
    if (pollingInterval) {
      console.log('立即以最新时间开始新的轮询');
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
      timerRef.current = window.setTimeout(() => {
        fetchInstance.refresh();
      }, pollingInterval);
    },
    onCancel: stopPolling,
  };
};

export default usePollingPlugin;
