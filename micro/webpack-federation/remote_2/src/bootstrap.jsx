import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';

import Content from './Content';

const RemoteNewList = lazy(() => import('remote_1/newsList'));

const ele = (
  <div>
    This is remote_1, port: 3000
    <p>本地组件: </p>
    <Content />
    <p>远程组件: </p>
    <Suspense fallback={<div>loading...</div>}>
      <RemoteNewList />
    </Suspense>
  </div>
);

ReactDOM.render(ele, document.getElementById('root'));
