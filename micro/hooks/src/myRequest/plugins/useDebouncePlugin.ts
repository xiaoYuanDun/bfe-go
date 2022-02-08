import { useRef, useMemo, useEffect } from 'react';
import debounce from 'lodash/debounce';

import type { Pulgin } from '../types';
import type { DebounceSettings, DebouncedFunc } from 'lodash';

const useDebouncePlugin: Pulgin<any, any> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait }
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>();

  // 转换为 lodash 的原始参数
  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceMaxWait !== undefined) ret.maxWait = debounceMaxWait;
    if (debounceLeading !== undefined) ret.leading = debounceLeading;
    if (debounceTrailing !== undefined) ret.trailing = debounceTrailing;
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  // TODO，和 runAsync 同时使用，第一次防抖会失效
  useEffect(() => {
    if (debounceWait) {
      // 取出原始方法，在外部做一层代理
      const originAsync = fetchInstance.runAsync.bind(fetchInstance);

      console.log('call plugin debounce');
      debouncedRef.current = debounce(
        (callback: Function) => callback(),
        debounceWait,
        options
      );

      // 会生成很多无效 promise，感觉实现不太好
      // 如果用户在 runAsync 后接 then，那么只有最后一个节流的 promise 的 then 会得到执行
      // fetchInstance.runAsync = (...args) => {
      //   return new Promise((resolve, reject) => {
      //     debouncedRef.current?.(() => {
      //       originAsync(...args)
      //         .then(resolve)
      //         .catch(reject);
      //     });
      //   });
      // };
      fetchInstance.runAsync = (...args) => {
        debouncedRef.current?.(() => originAsync(...args));
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) return {};

  return {};
};

export default useDebouncePlugin;
