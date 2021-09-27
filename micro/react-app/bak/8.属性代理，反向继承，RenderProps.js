import React from 'react'
import ReactDom from 'react-dom'

// 高阶组件 属性继承，需要子组件配合
const withLoading = (message) => (OldComponent) => {
  return class extends React.Component {
    state = {
      show: () => {
        const div = document.createElement('div')
        div.innerHTML = `<p id="loading" style="color: red; background-color:gray">${message}</p>`
        div.id = 'div'
        document.body.appendChild(div)
      },
      hide: () => {
        const div = document.getElementById('div')
        div.remove()
      }
    }
    render() {
      return <OldComponent {...this.state} />
    }
  }
}

class ShowHide extends React.Component {
  render() {
    return <div>
      <button onClick={this.props.show}>显示</button>
      <button onClick={this.props.hide}>隐藏</button>
    </div>
  }
}

const WithLoadingCom = withLoading('加载中...')(ShowHide)

// 反向继承 一般用于第三方组件，不能更改里面的内容，但是可以增强的作用
// 主要是继承父组件，然后拿到父组件的vdom，继承里面的props，增加props参数，和增加子元素，有点类似slot

class Button extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: '张三' }
  }
  componentDidMount() {
    console.log('button mount')
  }
  render() {
    console.log('button render')
    return <button name={this.state.name} title={this.props.title} />
  }
}

const revertExtends = (OldComponent) => {
  return class extends OldComponent {
    constructor(props) {
      super(props)
      this.state = { ...this.state, number: 0 }
    }
    componentDidMount() {
      console.log('revertExtends mount')
    }
    render() {
      console.log('revertExtends render')
      const renderVdom = super.render()
      const newProps = {
        ...renderVdom.props,
        ...this.state,
        title: 123,
        onClick: () => {
          this.setState({
            number: this.state.number + 1
          })
        }
      }
      return React.cloneElement(renderVdom, newProps, <span>{newProps.title}</span>)

    }
  }
}

const ReverComponent = revertExtends(Button)

// Render Props
class MouseComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0
    }
  }
  handleMoveMouse = (e) => {
    console.log(e)
    this.setState({
      x: e.clientX,
      y: e.clientY
    })
  }
  render() {
    let render = typeof this.props.render === 'function' ? this.props.render : this.props.children
    return <div onMouseMove={this.handleMoveMouse}>
      {render(this.state)}
    </div>
  }
}

const withMouse = (OldComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        x: 0,
        y: 0
      }
    }
    handleMoveMouse = (e) => {
      console.log(e)
      this.setState({
        x: e.clientX,
        y: e.clientY
      })
    }
    render() {
      return <div onMouseMove={this.handleMoveMouse}>
        <OldComponent {...this.state} />
      </div>
    }
  }
}

const MouseChild = (props) => (<div>
  鼠标操作
  <h1>x: {props.x}</h1>
  <h1>y: {props.y}</h1>
</div>)

const MouseCom = withMouse(MouseChild)

ReactDom.render(<MouseCom>
</MouseCom>, document.getElementById('root'))
