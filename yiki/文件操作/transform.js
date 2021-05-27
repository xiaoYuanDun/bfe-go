const { Readable, Writable, Duplex, Transform } = require('stream')
const fs = require('fs')
const path = require('path')
class MyTrans extends Transform {
    _transform(thunk) {
        thunk = thunk.toString().toUpperCase()
        this.push(thunk)
    }
}

const rs = fs.createReadStream(path.resolve(__dirname, './test.txt'))
const ws = fs.createWriteStream(path.resolve(__dirname, './write.txt'))
const myTransForm = new MyTrans()
rs.pipe(myTransForm).pipe(ws)