import React, { memo, useEffect, useState } from 'react';
// import { useRequest } from 'ahooks';

import { useMount } from '../myHooks';
import { getDetailById } from './services';
import useRequest from '../myRequest/useRequest';

function Polling() {
  const [polling, setPolling] = useState(1000);

  const { loading, data, cancel, runAsync } = useRequest(
    () => getDetailById('22'),
    {
      pollingInterval: polling,
      // manual: true,
      // pollingWhenHidden: false,
    }
  );

  useEffect(() => {
    console.log('change to ', polling);
  }, [polling]);

  const handleTimer = () => {
    console.log('10s 后，pollingInterval 变为 2');
    setTimeout(() => {
      console.log('pollingInterval 已变更，查看表现.');
      setPolling(2000);
    }, 10000);
  };

  console.log(`[render once]---, loading: ${loading}, data: ${data}`);

  return (
    <div>
      {loading
        ? 'loading...'
        : `${data}, ${Math.floor(Math.random() * 100)}` || 'no data'}
      <div>
        <button onClick={runAsync}>run</button>
        <button onClick={cancel}>cancel</button>
        <button onClick={handleTimer}>timer</button>
        <p />

        <button onClick={() => setPolling(0)}>change to 0</button>
        <button onClick={() => setPolling(1000)}>change to 1000</button>
        <button onClick={() => setPolling(2000)}>change to 2000</button>
        <button onClick={() => setPolling(5000)}>change to 5000</button>
        <button onClick={() => setPolling(10000)}>change to 10000</button>
      </div>
    </div>
  );
}

export default memo(Polling);
