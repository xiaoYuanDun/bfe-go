import React, { useEffect, useState } from 'react';
import ErrorBoundary from './boundary';

const ErrorTest = () => {
  const [count, setCount] = useState(0);

  // 点击到奇数时, 会报错, 导致页面崩溃
  useEffect(() => {
    if (count % 2 === 0) {
      console.log('right');
    } else {
      throw new Error('FKU');
    }
  });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>add</button>
      this is error test..
    </div>
  );
};

export default ErrorTest;
