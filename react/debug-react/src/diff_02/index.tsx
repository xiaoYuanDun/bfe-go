import React, { Fragment, useState } from 'react';

// DIFF 调试
function Root() {
  const [arr, setArr] = useState(['A', 'B', 'C']);

  const handleAdd = () => setArr(['A', 'C', 'B']);

  const handleMinus = () => setArr(['A', 'B']);

  return (
    <Fragment>
      <button key="b1" onClick={handleAdd}>
        click me add{' '}
      </button>
      <button key="b2" onClick={handleMinus}>
        click me minus
      </button>
      <div key="xxx">
        {arr.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </Fragment>
  );
}

export default Root;
