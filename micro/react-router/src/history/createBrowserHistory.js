function createBrowserHistory() {
    let listeners = []
    let state
    function listen(listener) {
        listeners.push(listener)
        return () => {
            listeners = listeners.filter((item) => item !== listener)
        }
    }
    const globalHistory = window.history
    function go(n) {
        Object.assign(history, { action: 'POP' })
        globalHistory.go(n)
    }
    function goBack() {
        go(-1)
    }

    function goForward() {
        go(1)
    }

    window.addEventListener('popstate', function () {
        let location = { pathname: window.location.pathname, state: globalHistory.state }
        notify({ location, action: 'POP' })
    })

    function notify(params) {
        Object.assign(history, params)
        history.length = globalHistory.length
        listeners.forEach((listener) => listener(history.location))
    }

    function push(pathname, nextState) {
        const action = 'PUSH'
        if (typeof pathname === 'object') {
            pathname = pathname.pathname
            state = pathname.state
        } else {
            state = nextState
        }
        globalHistory.pushState(state, null, pathname)
        let location = { state, pathname }
        notify({ action, location })
    }

    const history = {
        action: 'POP',
        go,
        goBack,
        goForward,
        push,
        listen,
        location: { pathname: window.location.pathname, state: globalHistory.state }
    }
    return history
}

export default createBrowserHistory