import React, { useLayoutEffect, useRef } from 'react';

const shallowEqual = (a, b) => a === b;

const useSelector = (selector: any) => {
  const { store }: any = { store: {} }; // context

  const latestSelectedState = useRef();

  const storeState = store.getState();

  // 这轮 select 的最终值
  let selectedState: any;

  // 使用最新的 selector 选到的值
  const newSelectedState = selector(storeState);

  // === undefined 表示首次 select
  if (
    latestSelectedState === undefined ||
    !shallowEqual(latestSelectedState.current, newSelectedState)
  ) {
    selectedState = newSelectedState;
  } else {
    // 否则表示没有更新, 使用上一次的值
    selectedState = latestSelectedState.current;
  }

  useLayoutEffect(() => {
    // 每轮 selector 更新这个值, 保存了最新的一次 selectedState
    latestSelectedState.current = selectedState;
  });

  useLayoutEffect(() => {
    //
  }, []);

  return newSelectedState;
};

export default useSelector;
