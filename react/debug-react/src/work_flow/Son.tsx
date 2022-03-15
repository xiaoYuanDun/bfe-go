import React, { FC, useEffect } from 'react';

type SonProps = {};

const Son: FC<SonProps> = (props) => {
  const { name } = props;
  useEffect(() => {
    console.log('son useEffect invoke');
    return () => {
      console.log('son destoryer called.');
    };
  });
  return <div> this is son: {name}</div>;
};

export default Son;
