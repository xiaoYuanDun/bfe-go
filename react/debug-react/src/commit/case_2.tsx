import React, { useEffect, useState, useLayoutEffect, Component } from 'react';

// useEffect

function ShowNum(props: any) {
  return <p>{props.num}</p>;
}

class SubShowName extends Component<any> {
  componentWillUnmount() {
    console.log('class: ----====---->>');
    console.log('SubShowName componentWillUnmount...');
  }
  render() {
    return <p>{this.props.name}</p>;
  }
}
class ShowName extends Component<any> {
  getSnapshotBeforeUpdate() {
    console.log('class: ----====---->>');
    console.log('getSnapshotBeforeUpdate...');
    return null;
  }
  componentDidUpdate() {
    console.log('class: ----====---->>');
    console.log('ShowName componentDidUpdate...');
  }
  componentWillUnmount() {
    console.log('class: ----====---->>');
    console.log('ShowName componentWillUnmount...');
  }
  render() {
    return (
      <div>
        <span>asdasdasd</span>
        <SubShowName name={this.props.name} />
      </div>
    );
  }
}

function App() {
  const [num, setNum] = useState(1);

  useEffect(() => {
    console.log('FC: ----====---->>');
    console.log('every time');
    return () => {
      console.log('every unmount');
    };
  });

  const [name, setName] = useState('xiaoMing');

  useEffect(() => {
    console.log('FC: ----====---->>');
    console.log('invoke once');
    return () => {
      console.log('---------------------------------------------FC unmount');
    };
  }, []);

  useLayoutEffect(() => {
    console.log('FC: ----====---->>');
    console.log('every useLayoutEffect');
    return () => {
      console.log('every layout unmount');
    };
  });

  const handleClick = () => {
    setNum(num + 1);
    setName(name === 'danny' ? 'danny' : 'xiaoMing');
  };

  return (
    <div>
      <button onClick={handleClick}>click me</button>
      {num % 3 === 0 ? null : <ShowNum num={num} />}
      {num % 2 === 0 ? null : <ShowName name={name} />}
    </div>
  );
}

export default App;
