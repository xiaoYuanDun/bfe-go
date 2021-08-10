import React from './react'
import ReactDom from './react-dom'



// const element = React.createElement('h1', {
//   className: 'title',
//   style: {
//     color: 'red'
//   }
// }, 'hello', React.createElement('span', null, 'world'))

const FunctionComponent2 = (props) => {
  return <h1>{props.title}</h1>
}

const FunctionComponent = (props) => {
  return <FunctionComponent2 {...props} />
}
// 类组件
class ReactClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 1
    }
  }
  handleAddCount = () => {
    this.setState({ count: this.state.count + 1 })
    console.log(this.state.count)
    this.setState({ count: this.state.count + 1 })
    console.log(this.state.count)
  }
  render() {
    return <div onClick={this.handleAddCount}>{this.state.count}</div>
  }
}

// 函数式组件
const element2 = React.createElement(
  FunctionComponent, {
  title: '标题1'
}
)

// 类组件
const class1Component = React.createElement(ReactClass, {
  title: '标题2'
})

ReactDom.render(class1Component, document.getElementById('root'))