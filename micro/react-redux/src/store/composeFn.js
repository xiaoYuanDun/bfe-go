function promise(store) {
    return function (next) {

        return function (action) {
            /**
             * function (action) {
            console.log('thunk')
            function (action) {
            console.log('logger')
            next(action)
            }(action)
        }
             */
            console.log(action)
            console.log('promise')
            next(action)
        }
    }
}

function thunk(store) {
    return function (next) { 
        /**
         * function (action) {
            console.log('logger')
            next(action)
        }
         */
        return function (action) {
            console.log('thunk')
            next(action)
        }
    }
}

function logger(store) {
    return function (next) {
        console.log(1)
        return function (action) {
            console.log('logger')
            next(action)
        }
    }
}

function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args))) // (...args) => promise(thunk(logger(...args)))
}

const middlewares = [promise, thunk, logger]
const store = {
    getState: () => 0,
    dispatch: (action) => {
        console.log(1)
    }
}
const middleware = middlewares.map(middleware => middleware(store)) 

const composeFn = compose(...middleware)// 从右到左执行next，然后返回的函数传入后面

const newDispatch = composeFn(store.dispatch)// 从右到左执行next，然后返回的函数传入后面

// newDispatch({type: 'ADD'}) // 然后从左到右开始执行