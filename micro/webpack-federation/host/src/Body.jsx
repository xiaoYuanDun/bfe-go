import React, { lazy, Suspense } from 'react';
import Banner from './Banner';

const RemoteComponent = lazy(() => import('remote_1/newsList'));

React.xxxx = '123';

function Body() {
  return (
    <div>
      This is remote_2, port: 3001
      <p>本地组件: </p>
      <Banner />
      <p>远程组件: </p>
      <Suspense fallback={<div>loading...</div>}>
        <RemoteComponent />
      </Suspense>
    </div>
  );
}

export default Body;
