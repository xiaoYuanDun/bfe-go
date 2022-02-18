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
  const timerRef = useRef<number>();
  const unsubscribeRef = useRef<() => void>();

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      console.log(`${timerRef.current} 被清除了`);
      timerRef.current = undefined;
    }
    unsubscribeRef.current?.();
  };

  const cancelPolling = () => {
    console.log('cancelPolling');
    stopPolling();
    timerRef.current = -1;
  };

  useUpdateEffect(() => {
    if (timerRef.current === -1) return;

    if (!pollingInterval) {
      stopPolling();
    } else if (isDocumentVisible() || pollingWhenHidden) {
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        fetchInstance.refresh();
      }, pollingInterval);
    }
  }, [pollingInterval]);

  // 对于提前返回的逻辑，注意需要放在正确的位置，不要影响 hooks 顺序
  // 不配置 polling 设置项，不做任何操作，直接返回
  if (!pollingInterval) {
    return {
      onCancel: cancelPolling, // 处理 pollingInterval 为 0 时，点击取消的问题，如果不返回，无法将状态置为 cancel
      onBefore: stopPolling, // 处理 激活轮询时，要把 cancel 标识（-1）置为 undefined，如果不返回，状态一直是 -1，会造成误判
    };
  }

  return {
    // 开始一次新的请求前清除上一次的定时器
    onBefore: () => {
      console.log('onBefore');
      stopPolling();
    },
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

      console.log('onFinally 启动: ', timerRef.current);
      console.log(' ');
    },
    onCancel: cancelPolling,
  };
};

// --------------------------------

// const usePollingPlugin: Pulgin<any, any> = (
//   fetchInstance,
//   { pollingInterval, pollingWhenHidden = true }
// ) => {
//   const timerRef = useRef<number>();
//   const unsubscribeRef = useRef<() => void>();

//   const stopPolling = () => {
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//       console.log(`${timerRef.current} 被清除了`);
//       timerRef.current = undefined;
//     }
//     unsubscribeRef.current?.();
//   };

//   useUpdateEffect(() => {
//     if (!pollingInterval) {
//       stopPolling();
//     } else if (timerRef.current) {
//       // if pollingInterval is changed, restart polling
//       clearTimeout(timerRef.current);
//       timerRef.current = setTimeout(() => {
//         fetchInstance.refresh();
//       }, pollingInterval);
//     }
//   }, [pollingInterval]);

//   // 对于提前返回的逻辑，注意需要放在正确的位置，不要影响 hooks 顺序
//   // 不配置 polling 设置项，不做任何操作，直接返回
//   if (!pollingInterval) {
//     return {
//       onBefore: stopPolling,
//     };
//   }

//   return {
//     // 开始一次新的请求前清除上一次的定时器
//     onBefore: () => {
//       console.log('onBefore');
//       stopPolling();
//     },
//     onFinally: () => {
//       // TODO, 待实现
//       if (!pollingWhenHidden && !isDocumentVisible()) {
//         unsubscribeRef.current = subscribeReVisible(() => {
//           fetchInstance.refresh();
//         });
//         return;
//       }

//       timerRef.current = window.setTimeout(() => {
//         fetchInstance.refresh();
//       }, pollingInterval);

//       console.log('onFinally 启动: ', timerRef.current);
//       console.log(' ');
//     },
//     onCancel: () => {
//       stopPolling();
//     },
//   };
// };

export default usePollingPlugin;

/**
 *
 * 1. 0
 * 2. cancel
 * 3. 1000
 * - 继续停止
 *
 * 1. cancel
 * 2. 0
 * 3. 1000
 * - 继续停止
 *
 * 1. cancel
 * 2. 0
 * 3. run
 * 4. 1000
 * - 开始
 *
 */
