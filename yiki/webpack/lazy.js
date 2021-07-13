function require() {

}
// 定义查找代码块的方法
require.find = {}

// 通过jsonp异步加载指定的代码块
require.ensure = (chunkId) => {
	let promises = []
	require.find.jsonp(chunkId, promises)
	return Promise.all(promises)
}
// 已经安装或者加载好的chunk，也可能是加载中的
var installChunks = {
	'main': 0
}

// 在jsonp里会创建promise，并且添加到promises数组里
require.find.jsonp = (chunkId, promises) => {

}