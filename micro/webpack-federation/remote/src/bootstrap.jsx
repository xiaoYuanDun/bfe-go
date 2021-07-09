import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';

import NewsList from './NewsList';

const RemoteBanner = lazy(() => import('remote_2/banner'));

const ele = (
  <div>
    This is remote_1, port: 3000
    <p>本地组件: </p>
    <NewsList />
    <p>远程组件: </p>
    <Suspense fallback={<div>loading ...</div>}>
      <RemoteBanner />
    </Suspense>
  </div>
);

ReactDOM.render(ele, document.getElementById('root'));
