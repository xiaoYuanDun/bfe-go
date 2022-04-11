import React from 'react';

import './App.less';

const App = () => {
  console.log('------------------------');
  console.log(window.__POWERED_BY_QIANKUN__);

  return (
    <div className="data-app-continer">
      <p className="common-text">this is data app ...</p>
    </div>
  );
};

export default App;
