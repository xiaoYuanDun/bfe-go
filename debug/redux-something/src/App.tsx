import React, { FC } from 'react';
import { useSelector, useDispatch, shallowEqual } from './origin';

const mapStateToProps = (s: any) => ({
  number: s.reducer_1.number,
});

// const mapDisToProps = (dispatch: any) => ({
//   add: () => dispatch({ type: 'ADD' }),
//   minus: () => dispatch({ type: 'MINUS' }),
// });

const App: FC<any> = () => {
  const { number } = useSelector(mapStateToProps, shallowEqual);
  const dispatch = useDispatch();

  // console.log('render app ...');
  return (
    <div className="app">
      number: {number}
      <br />
      <button onClick={() => dispatch({ type: 'ADD' })}>add</button>
      <button onClick={() => dispatch({ type: 'MINUS' })}>minus</button>
    </div>
  );
};

export default App;

// export default connect(mapStateToProps, mapDisToProps)(App);
