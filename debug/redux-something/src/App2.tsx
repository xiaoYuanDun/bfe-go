import React, { FC } from 'react';
import { useSelector, useDispatch, shallowEqual } from './origin';

const mapStateToProps = (s: any) => ({
  name: s.reducer_2.name,
});

const App: FC<any> = () => {
  const { name } = useSelector(mapStateToProps, shallowEqual);
  const dispatch = useDispatch();

  //   console.log('render app2 ...');
  return (
    <div className="app2">
      name: {name}
      <br />
      <button onClick={() => dispatch({ type: 'XIAOMING' })}>xiaoming</button>
      <button onClick={() => dispatch({ type: 'DANNY' })}>danny</button>
    </div>
  );
};

export default App;
