import React from 'react';
import { Link } from 'react-router-dom';

import './index.less';

const menuConfig = [
  { route: '/', text: 'return home' },
  { route: '/detail', text: 'to detail' },
  { route: '/data-app', text: 'to data app' },
  { route: '/user-app', text: 'to user app' },
];

const Menus = () => {
  return (
    <div className={'menus-wrapper'}>
      {menuConfig.map(({ route, text }) => (
        // <div key={route} className="menu-item">
        <div key={route} className={'menu-item'}>
          <Link to={route}>{text}</Link>
        </div>
      ))}
    </div>
  );
};

export default Menus;
