import React, { createContext, useState, useContext } from 'react';

export const MyContext = createContext({ name: 'xiaoMing' });

const ShowName = () => {
  const context = useContext(MyContext);

  return <p>{context.name}</p>;
};

const ContextChange = () => {
  const [contextValue, setContextValue] = useState({ name: 'xiaoMing' });

  const handleClick = () => {
    setContextValue({
      name: contextValue + '--',
    });
  };

  return (
    <div>
      <button onClick={handleClick}>click me ... </button>
      <MyContext.Provider value={contextValue}>
        <ShowName />
      </MyContext.Provider>
    </div>
  );
};

export default ContextChange;
