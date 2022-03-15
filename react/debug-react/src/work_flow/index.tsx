import React, { FC, useEffect, useState } from 'react';
import Son from './Son';

type IndexProps = {};

const Index: FC<IndexProps> = (props) => {
  useEffect(() => {
    console.log('root useEffect invoke');
    return () => {
      console.log('root destoryer called.');
    };
  });
  const [name, setName] = useState('haha');
  return (
    <div>
      <div>this is root</div>
      <Son name={name} />
      <button onClick={() => setName(name === 'haha' ? 'xiaoMing' : 'haha')}>
        click
      </button>
    </div>
  );
};

export default Index;
