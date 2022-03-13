import { hot } from 'react-hot-loader/root';
import React, { FC } from 'react';
import Header from './Head';

const App: FC = () => {

  return (
    <div className="app">
      <Header name="haha" />
      this is app to test hmr
      123 des
    </div>
  );
};

const _A = hot(App);
export default _A
// export default App;
