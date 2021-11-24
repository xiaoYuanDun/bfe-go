import React, { Component } from 'react';

class T1 extends Component<any, { index: number }> {
  handleOut = () => {
    console.log('out.');
  };
  handleIn = () => {
    console.log('in.');
  };
  render() {
    return (
      <div onClick={this.handleOut}>
        out
        <div onClick={this.handleIn}>in</div>
      </div>
    );
    // return <div>123</div>;
  }
}

export default T1;
