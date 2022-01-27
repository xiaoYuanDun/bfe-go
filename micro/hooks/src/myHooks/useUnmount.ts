import { useEffect } from 'react';

// 在一个组件卸载时执行一次
function useUnmount(func: () => void) {
  // 这是官方写法
  // useEffect(
  //   () => () => {
  //     func();
  //   },
  //   []
  // );

  // 这是自己的写法
  useEffect(() => func, []);
}

export default useUnmount;
