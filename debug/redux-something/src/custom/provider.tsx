import React, { createContext } from 'react';

const ReactReduxContext = createContext(null);

const Provider = ({ store, children, context }: any) => {
  const contextValue = context || { store };

  return (
    <ReactReduxContext.Provider value={contextValue}>
      {children}
    </ReactReduxContext.Provider>
  );
};

export default Provider;
