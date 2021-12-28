import React, { useEffect } from 'react';

const Son = () => {
  useEffect(() => {
    console.log('son change');
    return () => {
      console.log('son useEffect cb.');
    };
  });

  return <div>I am son</div>;
};

export default Son;
