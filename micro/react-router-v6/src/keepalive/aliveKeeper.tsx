import React, { useRef, useContext, useEffect } from 'react'
import { RootContext } from './aliveProvider'

const aliveKeeper = (Component: any, id: any) => {
  return (props: any) => {
    const ref = useRef<HTMLElement>(null)
    const { state, create } = useContext<any>(RootContext)

    useEffect(() => {
      if (state[id] && state[id].dom) {
        state[id].dom.forEach((_dom) => {
          ref.current?.appendChild(_dom)
        })
      } else if (!state[id]) {
        create(id, <Component />)
      }
    }, [state[id]])

    return <div ref={ref} className={`origin-wrapper-${id}`} />
  }
}

export default aliveKeeper
