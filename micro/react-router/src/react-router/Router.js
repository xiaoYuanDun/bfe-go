import React from 'react'
import RouterContext from './RouterContext'

class Router extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            location: props.history.location
        }

        this.unlisten = props.history.listen((location) => {
            this.setState({
                location
            })
        })
    }
    componentWillUnmount() {
        this.unlisten && this.unlisten()
    }
    render() {
        let value = { history: this.props.history, location: this.state.location }
        return <RouterContext.Provider value={value}>
            {this.props.children}
        </RouterContext.Provider>
    }
}

export default Router