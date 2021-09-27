import React from './react'
import ReactDom from './react-dom'

const Context = React.createContext()

class Headers extends React.Component {
  static contextType = Context
  render() {
    return <div style={{ border: `5px solid ${this.context.color}` }}>
      Header
      <Main />
    </div>
  }
}

const Main = () => {
  return <Context.Consumer>
    {
      (value) => {
        return <div style={{ border: `5px solid ${value.color}` }}>
          main
          <button onClick={() => { value.onChangeColor('green') }}>绿色</button>
          <button onClick={() => { value.onChangeColor('red') }}>红色</button>
        </div>
      }
    }

  </Context.Consumer>
}

class Count extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      color: 'red'
    }
    this.domRef = React.createRef()
  }

  handleChangeColor = (color) => {
    this.setState({
      color
    })
  }

  render() {
    const { color } = this.state
    const value = {
      color,
      onChangeColor: this.handleChangeColor
    }
    return <Context.Provider value={value}>
      <Headers>
      </Headers>
    </Context.Provider>
  }
}



ReactDom.render(<Count />, document.getElementById('root'))
