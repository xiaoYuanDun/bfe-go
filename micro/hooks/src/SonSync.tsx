import React, { memo } from 'react';
import { useRequest } from 'ahooks';

import { getDetailById } from './services';
import { useUpdateEffect } from './myHooks';
// import useRequest from './myRequest/useRequest';

function SonSync() {
  console.log('[render once]-------------------------');
  const { loading, data } = useRequest(() => getDetailById('22'));

  console.log('loading: ', loading, ', data: ', data);

  return <div>{loading ? 'loading...' : data}</div>;
}

export default memo(SonSync);
