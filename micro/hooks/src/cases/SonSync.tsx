import React, { memo, useEffect, useState } from 'react';
// import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import { useUpdateEffect } from '../myHooks';
import useRequest from '../myRequest/useRequest';

function SonSync() {
  const [name, setName] = useState('xiao');
  const [polling, setPolling] = useState(10000);
  const { loading, data, cancel } = useRequest(() => getDetailById('22'), {
    pollingInterval: polling,
    // loadingDelay: 1000,
  });

  useEffect(() => {
    setTimeout(() => {
      setPolling(2000);
      console.log('polling 改变造成的 render');
    }, 2000);
  }, []);

  console.log('[render once]-------------------------');
  console.log('loading: ', loading, ', data: ', data);

  return (
    <div>
      {loading
        ? 'loading...'
        : `${data}, ${Math.floor(Math.random() * 100)}` || 'no data'}
    </div>
  );
}

export default memo(SonSync);
