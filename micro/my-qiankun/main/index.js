import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import './init';

import Root from './src/App';

const ele = (
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);

render(ele, document.getElementById('root'));
