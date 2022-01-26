import React, { useEffect } from 'react';
// import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import { useUpdateEffect } from './myHooks';
import useRequest from './myRequest/useRequest';

function Son({ id }: { id: string }) {
  console.log('[render once]-------------------------');
  const { loading, data, run } = useRequest(getDetailById, { manual: true });

  console.log('id: ', id, ', loading: ', loading, ', data: ', data);

  useUpdateEffect(() => {
    run(id);
  }, [id]);

  return <div>{!id ? 'no id' : loading ? 'loading...' : data}</div>;
}

export default Son;
