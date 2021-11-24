import React, { Component } from 'react';

class T1 extends Component<any, { index: number }> {
  state = {
    index: 1,
  };

  handleAdd = () => {
    setTimeout(() => {
      console.log('调用setState 1');
      this.setState({
        index: this.state.index + 1,
      });
      console.log('state', this.state.index);
      console.log('调用setState 2');
      this.setState({
        index: this.state.index + 2,
      });
      console.log('state', this.state.index);
    }, 0);
  };

  render() {
    return (
      <div>
        {this.state.index}
        <br />
        <button onClick={this.handleAdd}> add ...</button>
      </div>
    );
  }
}

export default T1;
