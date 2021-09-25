import React, { useState } from 'react';

// DIFF 调试
function Root() {
  const [num, setNum] = useState(0);

  return (
    <div key="p-1">
      <button onClick={() => setNum(num + 1)}> + 1</button>
      {num % 2 === 0 ? <p>偶数</p> : null}
      {/* <p key={num}>偶数</p> */}
      <div>{num}</div>
    </div>
  );
}

export default Root;
