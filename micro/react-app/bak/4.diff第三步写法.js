import React from './react'
import ReactDom from './react-dom'


class List extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: ['A', 'B', 'C', 'D', 'E', 'F']
        }
    }
    handleChange = () => {
        this.setState(({
            list: ['A', 'C', 'D', 'B', 'G']
        }))
    }
    render() {
        return <React.Fragment>
            <ul>
                {this.state.list.map((item) => {
                    return <li key={item}>
                        {item}
                    </li>
                })}
            </ul>
            <button onClick={this.handleChange}>click</button>
        </React.Fragment>
    }
}



ReactDom.render(<List />, document.getElementById('root'))
