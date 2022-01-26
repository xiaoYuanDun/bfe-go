import React, { useEffect, useState, memo } from 'react';
import Son from './Son';
import SonSync from './SonSync';
// import SonTest from './SonTest';

function App() {
  const [id, setId] = useState<string>('');
  useEffect(() => {
    setTimeout(() => {
      setId('1');
    }, 1500);
  }, []);

  return (
    <div>
      {/* <Son id={id} /> */}
      <SonSync />
      {/* <SonTest /> */}
    </div>
  );
}

export default App;
