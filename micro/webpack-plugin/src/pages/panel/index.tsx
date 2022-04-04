import React, { FC, useState, PropsWithChildren } from 'react';
// import { Button } from 'antd';

interface PanelProps {}

const Panel: FC<PropsWithChildren<PanelProps>> = (props) => {
  const { children } = props;

  const [count, setCount] = useState(1);
  const handleClick = () => {
    throw new Error('go');
    console.log(res);
  };

  return (
    <div className="main-panel">
      {/* <Button onClick={handleClick}>click me </Button> */}
      <div>value is: {count}</div>

      {children}
    </div>
  );
};

export default Panel;
