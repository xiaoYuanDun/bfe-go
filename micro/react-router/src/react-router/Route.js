import React from 'react'
import RouterContext from './RouterContext'

class Route extends React.Component {
    static contextType = RouterContext
    render() {
        const { component: RouteComponent, path, exact } = this.props
        const { history, location } = this.context
        let RenderElemet = null
        const match = exact ? path === location.pathname : location.pathname.startWith(path)
        if (match) {
            const routeProps = {
                history,
                location,
            }
            RenderElemet = <RouteComponent {...routeProps} />
        }
        return RenderElemet
    }
}

export default Route