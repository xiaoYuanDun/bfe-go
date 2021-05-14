const path = require('path')

const WriteStream = require('./createWriteStream')
const ws = new WriteStream(path.resolve(__dirname, './write.txt'), {
	flags: 'w',
	autoClose: false,
	highWaterMark: 4, // 默认16*64 表示预计用多少内存来进行写，但即使超过了还是会往里面写
})


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
})