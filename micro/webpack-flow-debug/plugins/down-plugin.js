class DownPlugin {
  // 插件都会有一个apply方法，里面传入compiler
  apply(compiler) {
    compiler.hooks.down.tap('DownPlugin', () => {
      console.log('编译结束了')
    })
  }
}

module.exports = DownPlugin
