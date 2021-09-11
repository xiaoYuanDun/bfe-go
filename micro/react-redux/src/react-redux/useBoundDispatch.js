import React, { useContext } from 'react'
import bindActionCreators from '../redux/bindActionCreator'
import ReduxContext from './ReduxContext'

function useBoundDispatch(actions) {
    const context = useContext(ReduxContext)
    const { store } = context
    const { dispatch } = store
    return bindActionCreators(actions, dispatch)
}

export default useBoundDispatch