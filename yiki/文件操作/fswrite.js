const fs = require('fs')
const path = require('path')
const ws = fs.createWriteStream(path.resolve(__dirname, './write.txt'), {
  flags: 'w',
  autoClose: false,
  highWaterMark: 2, // 默认16*64 表示预计用多少内存来进行写，但即使超过了还是会往里面写
})

// const rs = fs.createReadStream(path.resolve(__dirname, './test.txt'), {
//   highWaterMark: 3, // 当读取大于写入的时候，会进入等待状态
//   flags: 'r',
// })
// write只接受字符串或者buffer
// flag根据highWaterMark来决定返回的是true或者false，
// 假如超出或等于设定值就会返回false，
// 然后将内容放入栈中，等待执行完再逐步写入，清空缓存区，如果缓存区过大会浪费内存，所以设置highwatermark来进行控制，达到预期后就不要再调用write方法了
// 并发异步 =》 串行异步
// let flag = ws.write('1')
// console.log(flag)
// flag = ws.write('1')
// console.log(flag)
// flag = ws.write('1')
// console.log(flag)
// flag = ws.write('12345')
// console.log(flag)

// // 只有当配置autoClose为true的时候才会调用
// ws.on('close', () => {
//   console.log('close')
// })

// ws.end() // end + close
// rs.on('data', (chunk) => {
//   console.log(chunk)
//   const flag = ws.write(chunk)
//   if (!flag) {
//     rs.pause()
//   }
// })

let i = 0

function write() {
  let flag = true
  while (i < 10 && flag) {
    flag = ws.write(i + '')
    i++
  }
}

write()

// 当写入完毕之后，触发的回调
ws.on('drain', () => {
  // 只有当有缓存并且清空的时候，才会触发drain
  console.log('吃完了')
  write()
  // rs.resume()
})