import React, { Fragment, useState } from 'react';

// DIFF 调试
function Root() {
  const [arr, setArr] = useState(['A', 'B', 'C', 'D', 'E', 'F']);

  const handleClick = () => setArr(['A', 'C', 'E', 'B', 'G']);
  return (
    <Fragment>
      <button onClick={handleClick}>click me</button>
      <ul>
        {arr.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Fragment>
  );
}

export default Root;
