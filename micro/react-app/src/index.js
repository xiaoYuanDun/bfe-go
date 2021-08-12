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
    this.inputRef = React.createRef()
  }
  handleFocus = () => {
    this.inputRef.current.focus()
  }
  render() {
    return <div>
      <RefElement ref={this.inputRef} />
      <button onClick={this.handleFocus}>点击输入焦点</button>
    </div>
  }
}

ReactDom.render(<Form />, document.getElementById('root'))