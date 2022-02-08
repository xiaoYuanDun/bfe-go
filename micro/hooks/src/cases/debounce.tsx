import React, { memo } from 'react';
import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import { useUpdateEffect } from '../myHooks';
// import useRequest from '../myRequest/useRequest';

function DebounceCase() {
  const { loading, data, runAsync } = useRequest(getDetailById, {
    manual: true,
    debounceWait: 500,
  });

  // console.log('[render once]-------------------------');
  // console.log('loading: ', loading, ', data: ', data);

  return (
    <div>
      <input
        onChange={(e) => {
          const val = e.target.value;
          console.log(val);
          runAsync(val).then((res) => {
            console.log('then', res);
          });
        }}
      />
      <br />
      {loading ? 'loading' : data}
    </div>
  );
}

export default memo(DebounceCase);
