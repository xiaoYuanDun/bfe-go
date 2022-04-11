import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Detail from './Detail';
import Home from './Home';
import Menus from './Menus';

import './App.less';

const App = () => {
  return (
    <div className="root-continer">
      <Menus />
      <p className="common-text">这里是主应用区域，不随着路由切换变化 ...</p>

      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={'/detail'} element={<Detail />} />
      </Routes>
    </div>
  );
};

export default App;
