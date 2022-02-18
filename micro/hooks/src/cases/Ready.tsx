import React, { memo, useState } from 'react';
// import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import useRequest from '../myRequest/useRequest';

const Ready = () => {
  const [manual, setManual] = useState(false);
  const [ready, setReady] = useState(false);
  const [params, setParams] = useState('');

  const { loading, data, cancel, runAsync } = useRequest(
    () => getDetailById(params),
    {
      manual,
      ready,
      defaultParams: ['momo'],
      refreshDeps: [params],
      //   refreshDepsAction
    }
  );

  console.log(`[render once]---, loading: ${loading}, data: ${data}`);

  return (
    <div>
      <div>
        {loading
          ? 'loading...'
          : `${data}, ${Math.floor(Math.random() * 100)}` || 'no data'}
      </div>
      <button onClick={() => setReady(!ready)}>ready to: {`${!ready}`}</button>
      <button onClick={() => setManual(!manual)}>
        manual to: {`${!manual}`}
      </button>

      <button onClick={() => runAsync('run')}>run</button>

      <br />
      <input value={params} onChange={(e) => setParams(e.target.value)} />
    </div>
  );
};

export default memo(Ready);
