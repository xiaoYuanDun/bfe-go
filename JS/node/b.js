
var b = 'uu'

var a = require('./a').a
console.log('get a val: ', `${a}-${b}`)

module.exports = {
    b
}