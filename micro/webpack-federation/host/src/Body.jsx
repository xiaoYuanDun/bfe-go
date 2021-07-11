import React, { lazy, Suspense } from 'react';
import Banner from './Banner';

const RemoteNewList = lazy(() => import('remote_1/newsList'));
const RemoteContent = lazy(() => import('remote_2/content'));

React.xxxx = '123';

function Body() {
  return (
    <div>
      This is remote_2, port: 3001
      <p>本地组件: </p>
      <Banner />
      <p>远程组件: </p>
      <Suspense fallback={<div>loading...</div>}>
        <RemoteContent />
      </Suspense>
      <Suspense fallback={<div>loading...</div>}>
        <RemoteNewList />
      </Suspense>
    </div>
  );
}

export default Body;
