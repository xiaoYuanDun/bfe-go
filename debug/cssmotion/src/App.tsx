import React, { useState } from 'react';
import CSSMotion from 'rc-motion';

const App = () => {
  const [visible, setVisible] = useState(false);

  console.log('visible', visible);
  return (
    <>
      <button onClick={() => setVisible(!visible)}>click me</button>
      <CSSMotion visible={visible} motionName="my-motion">
        {({ className, style }) => {
          console.log('className, style', className, style);
          return <div className={className} style={style} />;
        }}
      </CSSMotion>
    </>
  );
};

export default App;
