import React, { Component } from 'react';

class ClassComponent1 extends Component<{ title: string }> {
  render() {
    return <div key="cc-child">CC, {this.props.title}</div>;
  }
}

export default ClassComponent1;
