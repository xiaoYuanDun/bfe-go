import React, { Component } from 'react';

export default class Counter extends Component<{}, { counter: number }> {
  state = {
    counter: 0,
  };

  handleClick = () => {
    this.setState({ counter: this.state.counter + 1 });
    // this.setState((prev) => ({ counter: prev.counter + 1 }));
    console.log('setState_1', this.state.counter);

    this.setState({ counter: this.state.counter + 2 });
    // this.setState((prev) => ({ counter: prev.counter + 1 }));
    console.log('setState_2', this.state.counter);

    this.setState({ counter: this.state.counter + 3 });
    // this.setState((prev) => ({ counter: prev.counter + 1 }));
    console.log('setState_3', this.state.counter);

    this.setState({ counter: this.state.counter + 4 });

    this.setState({ counter: this.state.counter + 5 });

    // setTimeout(() => {
    //   this.setState({ counter: this.state.counter + 1 });
    //   console.log('setState_3', this.state.counter);
    //   this.setState({ counter: this.state.counter + 1 });
    //   console.log('setState_4', this.state.counter);
    // }, 0);
  };

  render() {
    return (
      <div>
        <p>{this.state.counter}</p>
        <button onClick={this.handleClick}>click me .</button>
      </div>
    );
  }
}
