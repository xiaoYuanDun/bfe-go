import React from './react'
import ReactDom from './react-dom'



// const element = React.createElement('h1', {
//   className: 'title',
//   style: {
//     color: 'red'
//   }
// }, 'hello', React.createElement('span', null, 'world'))

const FunctionComponent2 = (props, forwardRef) => {
  return <input ref={forwardRef} />
}
// ref不能通过props传递下去
const RefElement = React.forwardRef(FunctionComponent2)

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('constructor')
  }

  componentWillMount() {
    console.log('componentWillMount')
  }

  componentDidMount() {
    console.log('componentDidMount')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate')
    return nextState.number % 2 === 0
  }

  componentWillUpdate() {
    console.log('componentWillUpdate')
  }

  componentDidUpdate() {
    console.log('componentDidUpdate')
  }



  handleFocus = () => {
    this.setState({
      number: this.state.number + 1
    })
  }
  render() {
    return <div>
      {this.state.number}
      <button onClick={this.handleFocus}>点击输入焦点</button>
    </div>
  }
}

ReactDom.render(<Form />, document.getElementById('root'))