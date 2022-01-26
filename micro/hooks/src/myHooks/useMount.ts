import { useEffect } from 'react';

// 在一个组件存活期间，只执行一次
function useMount(func: Function) {
  useEffect(() => {
    func?.();
  }, []);
}

export default useMount;
