### 和微前端相关的一些概念

- 模块打包有两种不同的形式：`in-browser`, `build-time`

- `in-browser` 模块是不需要构建工具在打包过程中处理的，当其他模块在浏览器中使用它时，浏览器才会动态的发起资源请求，在 webpack 中，可以通过 externals 来配置此功能

- `build-time` 模块是指在构建工具打包时，就把模块的内容转化为行内代码，通过这种形式，在浏览器使用时，所有需要的资源都已经包含在总资源中了，无需发起额外的请求

- 浏览器环境下的，我们不能直接使用 `import react from 'react'` 这种形式的导入语句，因为浏览器并不知道如何 `'react'` 对应的请求地址到底是什么，需要使用完整的 url 地址，如: `https://cdn/.../.../react.min.js`。

- single-spa 中的 `importmap` 类型的 script标签 实际上就是起到了一个转化 引入别名 到 实际url地址 的作用，原生 script 标签的 type 并没有 importmap 这个值，这里属于自定义扩展

- `systemjs` 就是 importmap 的一个 polyfill

### systemjs 的打包格式

```js
// 这是没有配置 webpack.externals 的状态，可以看到 register 依赖是空数组
System.register(
	[], 
	(
		function(e, t){
			return{
				execute:function(){
					e({})
				}
			}
		}
	)
);
```

```js
// 如果配置了 webpack.external，并且打包格式为 system，则输出如下
System.register(
	["react", "lodash"], // 描述了要通过 system 动态加载的 js 模块
	(
		function(e, t){    // 这里的 setters，execute 也是 system 的固定格式，用于管理依赖
			var r={},o={};
			return {
				setters:[
					function() {},
					function() {}
				],
				execute: function() {
					// 这里就是我们自己的代码，经过打包加工后的压缩形式
					e(
						(()=>{"use strict";var e={978:e=>{e.exports=o},954:e=>{e.exports=r}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var u=t[r]={exports:{}};return e[r](u,u.exports,n),u.exports}n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var u={};return(()=>{n.r(u),n.d(u,{default:()=>e}),n(954),n(978);const e=function(e,t){return e+t}})(),u})()
					)
				}
			}
		}
	)
);
```




--- 


### todo

- qiankun 如何突破 systemjs 模块限制，import-html-entry