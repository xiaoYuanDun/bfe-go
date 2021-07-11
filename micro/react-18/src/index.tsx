import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  return <div>hi...</div>;
};

// legacy
ReactDOM.render(<App />, document.getElementById('root'));

// current
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
