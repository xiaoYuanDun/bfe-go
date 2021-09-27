import React, { useLayoutEffect, useMemo, useReducer } from 'react'
import bindActionCreators from '../redux/bindActionCreator'
import ReduxContext from './ReduxContext'
// 函数组件写法
export function connectHooks(mapStateToProps, mapDispatchToProps) {
    return (OldComponent) => {
        return function NewComponent(props) {
            const context = React.useContext(ReduxContext)
            const { store } = context

            const { getState, dispatch, subscribe } = store
            const lastState = getState()
            const state = useMemo(() => mapStateToProps(lastState), [lastState])


            const dispatchProps = useMemo(() => {
                let dispatchProps = {}
                if (typeof mapDispatchToProps === 'function') {
                    dispatchProps = mapDispatchToProps(dispatch)
                } else if (typeof mapDispatchToProps === 'object') {
                    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch)
                }
                return dispatchProps
            }, [])

            // 订阅方法需要比useEffect早执行, useReducer函数随便写，目的是在订阅的时候可以更新组件
            const [, forceUpdate] = useReducer(x => x + 1, 0)
            useLayoutEffect(() => {
                return subscribe(forceUpdate)
            }, [])

            return <OldComponent {...state} {...dispatchProps} {...props} />
        }
    }
}

// 类组件写法
function connect(mapStateToProps, mapDispatchToProps) {
    return (OldComponent) => {
        return class extends React.Component {
            static contextType = ReduxContext
            constructor(props, context) {
                super(props)
                const { store } = context
                const { getState, dispatch, subscribe } = store
                // 将状态映射为属性
                this.state = mapStateToProps(getState())
                this.unsubscribe = subscribe(() => {
                    this.setState(mapStateToProps(getState()))
                })
                let dispatchProps = {}
                if (typeof mapDispatchToProps === 'function') {
                    dispatchProps = mapDispatchToProps(dispatch)
                } else if (typeof mapDispatchToProps === 'object') {
                    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch)
                }
                this.dispatchProps = dispatchProps
            }

            componentWillUnmount() {
                this.unsubscribe && this.unsubscribe()
            }

            render() {
                return <OldComponent {...this.props} {...this.dispatchProps} {...this.state} />
            }
        }

    }
}

export default connect