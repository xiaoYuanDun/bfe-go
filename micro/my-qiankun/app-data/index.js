import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';

// 区分项目上下文
if (!window.__POWERED_BY_QIANKUN__) {
  ReactDOM.render(<App />, document.getElementById('root'));
}

export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  console.log('props', props);
  ReactDOM.render(
    <App />,
    props.container
      ? props.container.querySelector('#root')
      : document.getElementById('root')
  );
}

export async function unmount(props) {
  ReactDOM.unmountComponentAtNode(
    props.container
      ? props.container.querySelector('#root')
      : document.getElementById('root')
  );
}
