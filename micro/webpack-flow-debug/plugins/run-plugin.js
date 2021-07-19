class RunPlugin {
  // 插件都会有一个apply方法，里面传入compiler
  apply(compiler) {
    compiler.hooks.run.tap('RunPlugin', () => {
      console.log('开始编译了')
    })
  }
}

module.exports = RunPlugin
