const fs = require('fs')
const EventEmitter = require('events')
class CreateReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    this.path = path
    this.flags = options.flags || 'r'
    this.encoding = options.encoding || null
    this.autoClose = options.autoClose || false
    this.emitClose = options.emitClose || 0
    this.start = options.start || 0
    this.end = options.end
    this.highWaterMark = options.highWaterMark || 64 * 1024
    this.flowing = false // pause resume开关
    this.open()
    // 用户监听了data事件，才需要读取
    this.on('newListener', function (type) {
      if (type === 'data') {
        this.flowing = true
        this.read()
      }
    })
    this.offset = this.start
  }
  destroyed(err) {
    if (err) {
      this.emit('error', err)
    }
  }
  pause() {
    this.flowing = false
  }
  resume() {
    this.flowing = true
    this.read()
  }
  pipe(ws) {
    this.on('data', (thunk) => {
      const flag = ws.write(thunk)
      if (!flag) {
        this.pause()
      }
    })

    ws.on('drain', () => {
      this.resume()
    })
  }
  read() {
    if (typeof this.fd !== 'number') {
      this.once('open', () => this.read())
      return
    }
    let howMuchToRead = this.end
      ? Math.min(this.end - this.offset + 1, this.highWaterMark)
      : this.highWaterMark
    const buffer = Buffer.alloc(howMuchToRead)
    if (howMuchToRead <= 0) {
      return
    }
    fs.read(
      this.fd,
      buffer,
      0,
      howMuchToRead,
      this.offset,
      (err, bytesRead) => {
        if (bytesRead) {
          this.emit('data', buffer.slice(0, bytesRead))
          this.offset += howMuchToRead
          if (this.flowing) {
            this.read()
          }
        } else {
          this.emit('end')
          fs.close(this.fd, () => {
            if (this.autoClose) {
              this.emit('close')
            }
          })
        }
      }
    )
  }
  open() {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) return this.destroyed(err)
      this.fd = fd
      this.emit('open', fd)
    })
  }
}

module.exports = CreateReadStream
