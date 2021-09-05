import React from './react'
import ReactDom from './react-dom'

class CountComponent extends React.PureComponent {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }
  state = {
    count: 0
  }
  handleClick = () => {
    this.setState({
      count: this.state.count + parseInt(this.inputRef.current.value)
    })
  }
  render() {
    const { count } = this.state
    return <div>
      <CountChild count={count} />
      <MemoCountFn count={count} />
      <input ref={this.inputRef} />
      <button onClick={this.handleClick}>+</button>
    </div>
  }
}

class CountChild extends React.PureComponent {
  render() {
    console.log('class Render')
    return <div>
      类组件数值： {this.props.count}
    </div>
  }
}

const CountFn = (props) => {
  console.log('function Render')
  return <div>
    函数组件数值：{props.count}
  </div>
}

const MemoCountFn = React.memo(CountFn)

ReactDom.render(<CountComponent />, document.getElementById('root'))
