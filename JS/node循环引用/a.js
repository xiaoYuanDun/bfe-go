
var a = 'a'

var b = require('./b').b
console.log('get b val: ', `${a}-${b}`)

module.exports = {
    a
}