import React, { useEffect } from 'react';
// import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import { useUpdateEffect } from '../myHooks';
import useRequest from '../myRequest/useRequest';

function Son({ id }: { id: string }) {
  console.log('[render once]-------------------------');
  const { loading, data, runAsync } = useRequest(getDetailById, {
    manual: true,
    loadingDelay: 300,
  });

  console.log('id: ', id, ', loading: ', loading, ', data: ', data);

  useUpdateEffect(() => {
    runAsync(id);
  }, [id]);

  return <div>{loading ? 'loading...' : !id || !data ? 'no id' : data}</div>;
  // return <div>{loading ? 'loading...' : !id ? 'no id' : data}</div>;
}

export default Son;
