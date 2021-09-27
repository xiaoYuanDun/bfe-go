/**
 * 
 * @param {*} actionCreator function add(){return {type: ADD}} 
 * @param {*} dispatch store.dispatch
 */
function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args))
    }
}

function bindActionCreators(actionCreator, dispatch) {
    if (typeof actionCreator === 'function') {
        return bindActionCreator(actionCreator, dispatch)
    }
    const creators = {}
    for (const key in actionCreator) {
        creators[key] = bindActionCreator(actionCreator[key], dispatch)
    }
    return creators
}

export default bindActionCreators