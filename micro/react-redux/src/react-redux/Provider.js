import React from 'react'
import ReduxContext from './ReduxContext'

export default function Provider(props) {
    return <ReduxContext.Provider value={{ store: props.store }}>
        {props.children}
    </ReduxContext.Provider >
}
