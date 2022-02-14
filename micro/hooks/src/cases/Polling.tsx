import React, { memo, useEffect, useState } from 'react';
// import { useRequest } from 'ahooks';

import { useMount } from "../myHooks";
import { getDetailById } from './services';
import useRequest from '../myRequest/useRequest';

function Polling() {
  const [polling, setPolling] = useState(3000);

  const { loading, data, cancel, runAsync } = useRequest(() => getDetailById('22'), {
    pollingInterval: polling,
    // manual: true
  });

  const handleChange = () => {
    setPolling(polling === 1000 ? 3000 : 1000)
  }

  useEffect(() => {
    console.log('change to ', polling)
  }, [polling])

  useMount(() => {
    console.log('mounted !')
  })

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
      </div>
    </div>
  );
}

export default memo(Polling);
