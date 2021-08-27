<<<<<<< HEAD
import React from './react'
import ReactDom from './react-dom'
import './call-bind-apply'
=======
import React, { Component, useState } from 'react'
import ReactDom from 'react-dom'
>>>>>>> 5e8e7abde1abbe619ba5cee7d58ac2c478ba7d9a

const FunctionComponent2 = (props, forwardRef) => {
  return <input ref={forwardRef} />
}

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('Counter 1 constructor')
  }

  componentWillMount() {
    console.log('Counter 2 componentWillMount')
  }

  componentDidMount() {
    console.log('Counter 4 componentDidMount')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('Counter 5 shouldComponentUpdate')
    // 假如返回false，子组件也不会更新
    return nextState.number % 2 === 0
  }

  componentWillUpdate() {
    console.log('Counter 6 componentWillUpdate')
  }

  componentDidUpdate() {
    console.log('Counter 7 componentDidUpdate')
  }



  handleFocus = () => {
    this.setState({
      number: this.state.number + 1
    })
  }
  render() {
    console.log('Counter 3 render')
    return <div id={`dom-${this.state.number}`}>
      {this.state.number}
      {this.state.number === 4 ? null : <ChildCounter count={this.state.number} />}
      <button onClick={this.handleFocus}>点击输入焦点</button>
      <Show />
    </div>
  }
}
function Show() {
  const [name, setName] = useState('xiaoming')
  return <p>{name}</p>
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillUnmount() {
    console.log('ChildCounter 6 componentWillUnMount')
  }

  componentWillMount() {
    console.log('ChildCounter 1 componentWillMount')
  }

  componentDidMount() {
    console.log('ChildCounter 3 componentDidMount')
  }

  componentWillReceiveProps(nextProps) {
    console.log('ChildCounter 4 componentWillReceiveProps')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter 5 shouldComponentUpdate')
    return nextProps.count % 3 === 0
  }

  render() {
    console.log('ChildCounter 2 render')
    return <div>
      {this.props.count}
    </div>
  }
}

<<<<<<< HEAD
function Person(name) {
  this.list = ['1', '2', '3']
}

Person.prototype.getList = function () {
  return this.list
}

function Child(name) {
  this.name = name
  Person.call(this)
}

Child.prototype = new Person()

const child = new Child()
child.list.push(4)
console.log(child.getList())
const child2 = new Child()
console.log(child2.getList())





// ReactDom.render(<Counter />, document.getElementById('root'))
=======
class AAA  extends Component{
  state = {
    num: 0
  }
  componentDidMount() {
    this.setState((preState) => {
      console.log(preState)
      return { num: preState.num + 1 }
    }, () => {
      console.log(this.state.num);
    })
    this.setState(preState => {
      console.log(preState)
      return { num: preState.num + 1 }
    }, () => {
      console.log(this.state.num);
    })
  }
  render() {
    return 123
  }
}

ReactDom.render(<AAA />, document.getElementById('root'))
>>>>>>> 5e8e7abde1abbe619ba5cee7d58ac2c478ba7d9a
