import React from 'react'
import { Router } from '../react-router'
import { createHashHistory } from '../history'

class HashRouter extends React.Component {
    history = createHashHistory()
    render() {
        return (
            <Router history={this.history}>
                {this.props.children}
            </Router>
        )
    }
}

export default HashRouter

/**
 * createHashHistory 和 createBrowserHistory
 * 都会返回一个history对象，对象的方法和API是完全相同的，只是内部的实现原理不一样
 */