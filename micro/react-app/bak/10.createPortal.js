import React from './react'
import ReactDom from './react-dom'

class TestComponent extends React.Component {
  render() {
    return <div>
      sss
      <Dialog>模态框</Dialog>
    </div>
  }
}

class Dialog extends React.Component {
  constructor(props) {
    super(props)
    this.node = document.createElement('div')
    document.body.appendChild(this.node)
  }
  componentWillUnmount() {
    document.body.removeChild(this.node)
  }
  render() {
    return ReactDom.createPortal(<div>
      {this.props.children}
    </div>, this.node)
  }
}

ReactDom.render(<TestComponent />, document.getElementById('root'))
