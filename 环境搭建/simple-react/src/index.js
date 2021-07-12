import React from 'react';
import { render } from 'react-dom';
import App from './App';

const ele = <App />;

console.log('app', <App />);
render(ele, document.getElementById('root'));
