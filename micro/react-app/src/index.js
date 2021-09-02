import React from './react'
import ReactDom from './react-dom'


class Count extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: []
    }
    this.domRef = React.createRef()
  }

  getSnapshotBeforeUpdate() {
    return {
      scrollTop: this.domRef.current.scrollTop,
      scrollHeight: this.domRef.current.scrollHeight
    }
  }

  componentDidUpdate(props, state, snapShot) {
    const currentHeight = this.domRef.current.scrollHeight
    const prevHeight = snapShot.scrollHeight
    const addHeight = currentHeight - prevHeight
    this.domRef.current.scrollTop = snapShot.scrollTop + addHeight
  }

  componentDidMount() {
    const timer = setInterval(() => {
      this.handleChangeMessage()
    }, 1000)
  }

  handleChangeMessage = () => {
    const { message } = this.state
    this.setState({
      message: [`${message.length + 1}`, ...message]
    })
  }

  render() {
    const { message } = this.state
    return <React.Fragment>
      <div ref={this.domRef} style={{ height: '100px', overflowY: 'scroll', width: '100px' }}>
        {message.map((item) => {
          return <div key={item}>{item}</div>
        })}
      </div>
    </React.Fragment>
  }
}



ReactDom.render(<Count />, document.getElementById('root'))
