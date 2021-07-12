const ReadStream = require('./createReadStream')
const WriteStrem = require('./createWriteStream')
const path = require('path')
const rs = new ReadStream(path.resolve(__dirname, './test.txt'), {
  highWaterMark: 4,
})

const ws = new WriteStrem(path.resolve(__dirname, './write.txt'), {
  highWaterMark: 2,
})

rs.pipe(ws)
