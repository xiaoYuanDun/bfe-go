import { useRef } from 'react';

import { useUpdateEffect } from '../../myHooks';
import type { Pulgin } from '../types';

/**
 * 扩展 ready 功能
 * ready 会干预初始请求是否调用，所以会影响 loading
 */
const useAutoRunPlugin: Pulgin<any, any> = (
  fetchInstance,
  { ready = true, defaultParams = [], manual, refreshDeps = [] }
) => {
  // 每次 ready 变为 true，会执行一遍，不过要判断是否自动执行（manual）
  useUpdateEffect(() => {
    if (!manual && ready) {
      // TODO
      // hasAutoRun.current = true;
      fetchInstance.run(...defaultParams);
    }
  }, [ready]);

  // 监听的 ref 发生变化时，重新发起请求
  useUpdateEffect(() => {
    // TODO, 官方 hasAutoRun.current 的使用场景没搞清楚，暂时先这样吧
    if (!manual && ready) {
      fetchInstance.refresh();
    }
  }, [...refreshDeps]);

  return {
    onBefore: () => {
      if (!ready) {
        return {
          stopNow: true,
        };
      }
    },
  };
};

// 是否有必要
// useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
//   return {
//     loading: !manual && ready,
//   };
// };

export default useAutoRunPlugin;
