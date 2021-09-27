function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args))) // (...args) => promise(thunk(logger(...args)))
}

export default compose