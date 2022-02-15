import React, { memo, useEffect, useState } from 'react';
// import { useRequest } from 'ahooks';

import { useMount } from '../myHooks';
import { getDetailById } from './services';
import useRequest from '../myRequest/useRequest';

function Polling() {
  const [polling, setPolling] = useState(3000);

  const { loading, data, cancel, runAsync } = useRequest(
    () => getDetailById('22'),
    {
      pollingInterval: polling,
      manual: true,
      // pollingWhenHidden: false,
    }
  );

  const handleChange = () => {
    setPolling(polling === 1000 ? 3000 : 1000);
  };

  useEffect(() => {
    console.log('change to ', polling);
  }, [polling]);

  useMount(() => {
    console.log('mounted !');
  });

  const handleTimer = () => {
    console.log('10s 后，pollingInterval 变为 2');
    setTimeout(() => {
      console.log('pollingInterval 已变更，查看表现.');
      setPolling(2000);
    }, 10000);
  };

  console.log('[render once]-------------------------');
  console.log('loading: ', loading, ', data: ', data);

  return (
    <div>
      {loading
        ? 'loading...'
        : `${data}, ${Math.floor(Math.random() * 100)}` || 'no data'}
      <div>
        <button onClick={runAsync}>run</button>
        <button onClick={cancel}>cancel</button>
        <button onClick={handleChange}>change</button>
        <button onClick={handleTimer}>timer</button>
      </div>
    </div>
  );
}

export default memo(Polling);
