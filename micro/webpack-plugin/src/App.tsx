import React, { FC, Suspense, lazy, useState } from 'react';
import { Panel, Header } from './pages';

import './App.less';

const DynamicBottom = lazy(() => import('./pages/bottom'));

const App: FC = () => {
  return (
    <div className="app-root-continer">
      <Header name="haha" />
      <Panel>this is app ...</Panel>

      <Suspense fallback={<div>Loading...</div>}>
        <DynamicBottom />
      </Suspense>
    </div>
  );
};

export default App;
