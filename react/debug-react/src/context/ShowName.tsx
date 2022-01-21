import React, { useContext } from 'react';
import { MyContext } from './index';

const ShowName = () => {
  const context = useContext(MyContext);

  return <p>{context.name}</p>;
};

export default ShowName;
