import { hot } from 'react-hot-loader/root';
import React, { FC, lazy, Suspense } from 'react';
import Header from './Head';

const Head = lazy(() => import('./Head'));

const App: FC = () => {
  return (
    <div className="app">
      {/* 同步 */}
      {/* <Header name="haha" /> */}
      {/* 异步 */}
      <Suspense fallback={<div>Loading...</div>}>
        <Head name="haha" />
      </Suspense>
      this is app to test hmr 123 <input />
      <br />
      ddasdd
    </div>
  );
};

const _A = hot(App);
export default _A;
// export default App;
