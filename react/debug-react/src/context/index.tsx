import React, { createContext, useContext } from 'react';
import ShowName from './ShowName';

console.log('init context');

export const MyContext = createContext({ name: 'xiaoMing' });

const ele = (
  <div>
    <MyContext.Provider value={{ name: 'danny' }}>
      <ShowName />
      <MyContext.Provider value={{ name: 'aike' }}>
        <ShowName />
      </MyContext.Provider>
    </MyContext.Provider>
    <ShowName />
  </div>
);

export default ele;
