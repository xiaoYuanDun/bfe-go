import React from 'react';

const App = () => {
  const arr = new Array(10000).fill(0);

  return (
    <div>
      {arr.map((_, index) => (
        <div key={index}>{index}</div>
      ))}
    </div>
  );
};

export default App;
