import React from 'react'

export default class User extends React.Component {
    render() {
        console.log(this.props)
        return <div>
            User
            <button onClick={() => this.props.history.goBack()}>退回home</button>
        </div>
    }
}