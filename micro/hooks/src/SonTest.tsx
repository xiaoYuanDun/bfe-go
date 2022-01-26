import React, { FC, memo } from 'react';
import useRequest from './myRequest/useRequest';

const Sontest: FC = (props) => {
  console.log('render ...');
  const { go, loading, data } = useRequest(() => Promise.resolve(), {
    manual: true,
  });

  console.log('loading', loading);

  return (
    <div>
      xxx<button onClick={go}>click me</button>
    </div>
  );
};

export default memo(Sontest);
