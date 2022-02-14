import React, { useEffect, useState, memo } from 'react';
import Son from './Son';
import SonSync from './SonSync';
import DebounceCase from './debounce';
import Polling from "./Polling";

function App() {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      setId('1');
    }, 1000);
  }, []);

  return (
    <div>
      {/* <Son id={id} /> */}
      {/* <SonSync /> */}
      {/* <DebounceCase /> */}
      {<Polling />}
    </div>
  );
}

export default App;
