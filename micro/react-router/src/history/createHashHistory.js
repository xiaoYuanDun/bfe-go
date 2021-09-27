function createHashHistory() {
    let listeners = []
    let stack = [] // 类似于历史栈
    let index = -1 // 栈的指针，默认是-1
    let action = 'POP'
    let state;

    function listen(listener) {
        listeners.push(listener)
        return () => {
            listeners = listeners.filter((item) => item !== listener)
        }
    }

    function go(n) {
        action = 'POP'
        index += n
        let nextLocation = stack[index] // 取出指定索引对应的路径对象
        state = nextLocation.stack // 取出此location，对应的状态
        window.location.hash = nextLocation.pathname // 修改hash值
    }

    let hashChangeHandler = () => {
        let pathname = window.location.hash.slice(1)
        Object.assign(history, { action, location: { pathname, state } })
        if (action === 'PUSH') { // 说明调用push方法，需要往历史栈中添加新的条目
            stack[++index] = history.location
        }
        listeners.forEach((listener) => listener(history.location))
    }

    window.addEventListener('hashchange', hashChangeHandler)

    function goBack() {
        go(-1)
    }

    function goForward() {
        go(1)
    }

    function push(pathname, nextState) {
        action = 'PUSH'
        if (typeof pathname === 'object') {
            pathname = pathname.pathname
            state = pathname.state
        } else {
            state = nextState
        }
        // let location = { state, pathname }
        // stack.push(location)
        window.location.hash = pathname
    }


    const history = {
        action: 'POP',
        go,
        goBack,
        goForward,
        push,
        listen,
        location: { pathname: window.location.pathname, state: state }
    }

    if (window.location.hash) {
        action = 'PUSH'
        hashChangeHandler()
    } else {
        window.location.hash = '/'
    }
    return history
}

export default createHashHistory