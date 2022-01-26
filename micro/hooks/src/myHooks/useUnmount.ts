import { useEffect } from 'react';

// 在一个组件卸载时执行一次
function useUnmount(func: Function) {
  useEffect(
    () => () => {
      func();
    },
    []
  );
}

export default useUnmount;
