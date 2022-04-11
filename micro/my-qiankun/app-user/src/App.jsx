import React from 'react';

import styles from './App.less';

console.log('styles', styles);

const App = () => {
  return (
    <div className="user-app-continer">
      {/* <p className="common-text">this is user app ...</p> */}
      <p className={styles['common-text']}>this is user app ...</p>
    </div>
  );
};

export default App;
