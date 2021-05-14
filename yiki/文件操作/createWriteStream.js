const EmitEvent = require('events')
const fs = require('fs')
const Queue = require('./queue')

class WriteStrem extends EmitEvent {
	constructor(path, options = {}) {
		super()
		this.path = path
		this.flags = options.flags || 'w'
		this.autoClose = options.autoClose || true
		this.highWaterMark = options.highWaterMark || 16 * 1024
		this.encoding = options.encoding || 'utf-8'
		this.mode = options.mode || 0o666
		this.offset = 0
		this.len = 0
		this.fd = null
		this.writing = false
		// this.cache = [] // 优化：可以改成链式
		this.cache = new Queue()
		this.open()
		this.needDrain = false
	}
	clearBuffer() {
		// const data = this.cache.shift()
		const data = this.cache.poll()
		if (data) {
			const { thunk, encoding, cb } = data
			this._write(thunk, encoding, cb)
		} else {
			this.writing = false
			if (this.needDrain) {
				this.emit('drain')
			}
		}
	}
	open() {
		fs.open(this.path, this.flags, this.mode, (err, fd) => {
			if (err) return console.log(err)
			this.fd = fd
			this.emit('open', fd)
		})
	}
	_write(thunk, encoding, cb) {
		if (typeof this.fd !== 'number') {
			return this.once('open', () => {
				this._write(thunk, encoding, cb)
			})
		}

		fs.write(this.fd, thunk, 0, thunk.length, this.offset, (err, written) => {
			this.len -= written
			this.offset++
			cb()
		})
	}
	write(thunk, encoding = this.encoding, cb = () => { }) {
		thunk = Buffer.isBuffer(thunk) ? thunk : Buffer.from(thunk)

		const userCb = cb
		cb = () => {
			userCb()
			this.clearBuffer()
		}
		this.len += thunk.length
		let returnValue = this.len < this.highWaterMark
		this.needDrain = !returnValue // 检测是否需要调用drain的方法
		// 第一次写的时候走这里，无论有多少数据都写
		if (!this.writing) {
			this.writing = true
			this._write(thunk, encoding, cb)
		} else {
			// 加入缓存区
			// this.cache.push({
			// 	thunk,
			// 	encoding,
			// 	cb
			// })
			this.cache.offer({
				thunk,
				encoding,
				cb
			})
		}
		return returnValue
	}
}

module.exports = WriteStrem