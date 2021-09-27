import React from './react'
import ReactDom from './react-dom'


class Count extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0
    }
  }
  handleChange = () => {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return <React.Fragment>
      <CountChild count={this.state.count} />
      <button onClick={this.handleChange}>click</button>
    </React.Fragment>
  }
}

class CountChild extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }

  }
  static getDerivedStateFromProps(nextProps, state) {
    const { count } = nextProps
    if (count % 2 === 0) {
      return {
        number: count * 2
      }
    } else if (count % 3 === 0) {
      return {
        number: count * 3
      }
    }
    return {
      number: count
    }
  }
  render() {
    const { number } = this.state
    const { count } = this.props
    return <div>
      <div>
        number: {number}
      </div>
      <div>
        count: {count}
      </div>
    </div>
  }
}




ReactDom.render(<Count />, document.getElementById('root'))
