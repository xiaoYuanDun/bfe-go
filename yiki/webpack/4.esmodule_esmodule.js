function require() {

}

require.d = (exports, definition) => {
    for (var key in definition) {
        if (require.o(definition, key) && !require.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] })
        }
    }
}

require.o = (module, key) => {
    return Object.prototype.hasOwnProperty.call(module, key)
}

require.n = (module) => {
    var getter = module && module.__esModule ?
        () => (module['default']) : // 如果是es6模块的话，就会有default的值
        () => (module) // commonjs hu会默认导出对象本身，exports对象是默认导出对象
    require.d(getter, { a: getter }) // 基本上用不到
    return getter
}

let module = { name: 'title_name', age: 'title_age' }
let getter = require.n(module)
console.log(getter())