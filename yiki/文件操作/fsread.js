const fs = require('fs')
const path = require('path')
const CreateReadStream = require('./createReadStream')
const rs = new CreateReadStream(path.resolve(__dirname, './test.txt'), {
  //创建可读流参数，一般不用自己操 作
  flags: 'r',
  encoding: null, // 编码默认是buffer
  autoClose: true, // 相当于需要调用close方法
  emitClose: 0, // 触发一个close时间
  start: 0, // 从哪一个字节开始
  // end: 6, // 到哪一个字节结束 包含该字节
  highWaterMark: 3, // 每次读取的数据个数，默认就是64*1024
})
rs.on('open', function (fd) {
  console.log(fd) // 返回的是数字
})
// 每次读取的数据回调
rs.on('data', function (chunk) {
  console.log(chunk)
  // rs.pause() // 暂停读取
})

// 文件读取结束时的回调
rs.on('end', function () {
  console.log('end')
})

// 关闭文件时候的回调
rs.on('close', function () {
  console.log('close')
  // rs.resume()
  // clearInterval(timer)
})

rs.on('error', function (err) {
  console.log('error', err)
})

// let timer = setInterval(() => {
//   rs.resume() // 重新读取数据
// }, 10)
