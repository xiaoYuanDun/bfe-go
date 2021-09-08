import React from 'react'

export default class Home extends React.Component {
    handleChange = () => {
        const { history } = this.props
        history.push('/user', { id: 1 })
    }
    render() {
        return <div>
            Home
            <button onClick={this.handleChange}>去user</button>
        </div>
    }
}