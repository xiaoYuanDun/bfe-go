function createChannel() {
    let listeners = []

    function once(type, listener) {
        listener.type = type
        listener.cancel = () => {
            listeners = listeners.filter((i) => i !== listener)
        }
        listeners.push(listener)
    }
    function emit(action) {
        listeners.forEach((listener) => {
            if (listener.type === action.type) {
                listener.cancel()
                listener()
            }
        })
    }
    return {
        once,
        emit
    }
}

export default createChannel