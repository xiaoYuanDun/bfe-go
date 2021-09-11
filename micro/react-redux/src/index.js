import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter'
import Counter2 from './components/Counter2'
import Counter3 from './components/Counter3'
import { Provider } from './react-redux';
import store from './store'
console.log(store)
ReactDOM.render(
  <Provider store={store}>
    <Counter />
    {/* <Counter2 /> */}
    <Counter3 />
  </Provider>,
  document.getElementById('root')
);
