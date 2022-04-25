import React, { useEffect, useState, memo } from 'react';
import Son from './Son';
import SonSync from './SonSync';
import DebounceCase from './debounce';
import Polling from './Polling';
import Ready from './Ready';
import CreationTest from "./CreationTest";

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
      {/* {<Polling />} */}
      {/* <Ready /> */}
      <CreationTest />
    </div>
  );
}

export default App;
