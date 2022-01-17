import React, { useContext } from 'react';
import { MyContext } from './index';

const ShowName = () => {
  const context = useContext(MyContext);

  return `${context.name}, `;
};

export default ShowName;
