fs 的类型一般分为同步和异步两种方法

## fs.readFile

读取文件，读完回调，不进行写的操作，默认是 buffer 类型
读取文件时最好加上获取绝对路径的方式来读取
弊端：必须要读完之后才能写，最好能边读边写入
大文件用此方法有可能会淹没内存，内容 8g，文件 3g，淹没了 3 个 g

```
path.resolve(__dirname,'./package.json')
```

## fs.writeFile

写文件，默认会以 utf8 的形式来写入，如果文件不存在就创建

## fs.read 读写文件

可以使用 fs.open,fs.read,fs.write 的方法来操作文件
不过只适合小文件的方法
pipe 的原理

将大象放入冰箱的三个步骤，打开冰箱，放入冰箱，关闭冰箱

```
const fs = require('fs')
const path = require('path')

// 将大象放入冰箱的三个步骤，打开冰箱，放入冰箱，关闭冰箱
const buf = Buffer.alloc(3)
fs.open(path.resolve(__dirname, './1.js'), 'r', function (err, fd) {
    // fd 是一个文件标识符，是一个number类型
    fs.read(fd, buf, 0, 3, 0, function (err, bytesRead) {
        // bytesRead 是读取的长度，数据直接读取到buf里面
        console.log(bytesRead)
        // 拿到数据之后，需要再次打开文件，然后再写入
        fs.open(path.resolve(__dirname, './test.txt'), 'w', function (err, wfd) {
            fs.write(wfd, buf, 0, (err, written) => {
                // written 写入的长度
                console.log(written)
                // 读写完成后需要关闭
                fs.close(fd, () => { })
                fs.close(wfd, () => { })
            })
        })
    })
})
```

##文件可读流
不是一次性读取完，而是可以控制读取的个数和读取的速率

## 流的类型，可写流，可读流，双工流，转换流

### 转换流

对读写操作中的读数据，
链式调用 pipe，控制\_transForm 的方法，在里面拿到数据，然后进行数据操作，然后再用 this.push 返回到 cache 中，再传输给 ws 流

```
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
```
