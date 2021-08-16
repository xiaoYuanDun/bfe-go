import React, { Component, Fragment, useState } from 'react';

// getSnapshotBeforeUpdate

class App extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      name: 'xiaoMing',
    };
  }
  getSnapshotBeforeUpdate(prevProps: any, prevState: any) {
    console.log('----====---->>');
    console.log(prevProps, prevState);
    return 'hello';
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    console.log('----====---->>');
    console.log('prevProps', prevProps);
    console.log('prevState', prevState);
    console.log('snapshot', snapshot);
  }

  handleClick() {
    const name = this.state.name === 'xiaoHong' ? 'danny' : 'xiaoHong';
    this.setState({ name });
  }

  render() {
    return (
      <div>
        <button onClick={() => this.handleClick()}>click me</button>
        <p>{this.state.name}</p>
      </div>
    );
  }
}

export default App;
