var modules = {}
function require(moduleId) {
	if (cache[moduleId]) {
		return cache[moduleId].exports;
	}
	var module = cache[moduleId] = {
		exports: {}
	};
	modules[moduleId](module, module.exports, require);
	return module.exports;
}
// 定义查找代码块的方法
require.find = {}

// 通过jsonp异步加载指定的代码块
require.ensure = (chunkId) => {
	let promises = []
	require.find.jsonp(chunkId, promises)
	return Promise.all(promises)
}

require.publicPath = ''; // 资源文件访问路径 默认是空串
require.unionFileName = (chunkId) => { // 访问的文件名
	return '' + chunkId + '.js' // title.js
}


require.load = (url) => {
	let script = document.createElement('script')
	script.src = url
	document.head.appendChild(script)
}

// 已经安装或者加载好的chunk，也可能是加载中的
// 0表示已经加载成功
var installChunks = {
	'main': 0,
	// 'title' : [resolve,reject]
}

// 在jsonp里会创建promise，并且添加到promises数组里
require.find.jsonp = (chunkId, promises) => {
	var installChunkData;
	/**
	 * 假如多次加载，需要在这里进行处理
	 */
	let promise = new Promise((resolve, reject) => {
		installChunkData = installChunks[chunkId] = [resolve, reject]
	})
	installChunkData[2] = promise
	promises.push(promise)
	var url = require.publicPath + require.unionFileName(chunkIdF)
	require.load(url)
}

var webpackJsonpCallback = ([chunkIds, moreModules]) => {
	var resolves = []
	for (let i = 0; i < chunkIds.length; i++) {
		const chunkId = chunkIds[i][0]
		resolves.push(installChunkData[chunkId][0]) // 把chunk对应的promise的resolve方法添加到resolves数组里
		installChunkData[chunkId] = 0 // 0 表示已经加载完成
	}
	// 合并到module里面
	for (let moduleId in moreModules) {
		modules[moduleId] = moreModules[moduleId]
	}
	// 执行里面的resolve方法
	while (resolves.length) {
		resolves.shift()()
	}
}
// webpackChunk_2_bundle是 webpackChunk + 文件夹名称组成
var chunkLoadingGlobal = self['webpackChunk_2_bundle'] = self['webpackChunk_2_bundle'] || [] // 一开始是个空数组
chunkLoadingGlobal.push = webpackJsonpCallback; // 重写数组的push方法 在script导入标签之后，script里面的脚本会执行里面的push方法，从而触发这里的webpackJsonCallback

require.ensure('title').then(require.bind(require, './src/title.js')).then((result) => {
	console.log(result)
})