import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './store/main';
import App from './App';

const ele = (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(ele, document.getElementById('root'));
