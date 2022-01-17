import React, {
  createContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from 'react'

export const RootContext = createContext({})

const reducer = (state: any, action: any) => {
  const {
    type,
    payload: { id, ...rest },
  } = action
  switch (type) {
    case 'create':
    case 'dom':
      state = {
        ...state,
        [id]: {
          id,
          ...state[id],
          ...rest,
        },
      }
    default:
      break
  }
  return state
}

const AliveProvider = (props: any) => {
  const { children } = props
  const [state, dispatch] = useReducer(reducer, {})
  const create = useCallback((id, vdom) => {
    dispatch({ type: 'create', payload: { id, vdom } })
  }, [])
  console.log('state', state)
  const count = useRef({ num: 0 })
  useEffect(() => {
    count.current.num++
  })

  return (
    <RootContext.Provider value={{ state, create }}>
      {children}
      {Object.values(state)
        // .filter((item) => !item.dom)
        .map(({ id, vdom }: any, index) => {
          return (
            <div
              style={{ backgroundColor: 'ActiveCaption' }}
              className={`help-${id}`}
              // key={Math.random()}
              key={index}
              ref={(dom) => {
                console.log('vdom', vdom)
                if (dom && !state[id].dom) {
                  dispatch({
                    type: 'dom',
                    payload: { id, dom: [].slice.call(dom.childNodes) },
                  })
                }
              }}
            >
              {vdom}
              {count.current.num}
            </div>
          )
        })}
    </RootContext.Provider>
  )
}

export default AliveProvider
