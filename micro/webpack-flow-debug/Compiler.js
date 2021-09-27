const { SyncHook } = require('tapable')
const fs = require('fs')
const Complication = require('./Complication')
class Compiler {
  constructor(options) {
    this.options = options
    this.hooks = {
      run: new SyncHook(), // 开始启动编译
      emit: new SyncHook(), // 会在将要写入文件时候使用
      down: new SyncHook(), // 结束时的调用
    }
  }
  run(callback) {
    // 触发各个hooks
    this.hooks.run.call()
    // 4. 执行对象的 run 方法开始执行编译
    // 5. 根据配置中的 entry 找出入口文件
    this.compiler((err, assets) => {
      this.hooks.emit.call(assets)
      callback(null, {
        toJson: () => ({
          entries: this.entries,
          chunks: this.chunks,
          modules: this.modules,
          files: this.files,
          assets: this.assets,
        }),
      })
    })
    this.hooks.down.call()
    Object.values(this.options.entry).map((entry) => {
      fs.watchFile(entry, () => {
        this.compiler(callback)
      })
    })
    // 最后返回
    callback(null, {
      toJson() {
        return {
          files: [], //产出了哪些文件
          assets: [], //生成了那些资源
          chunk: [], //生成哪些代码块
          module: [], //模块信息
          entries: [], //入口信息
        }
      },
    })
  }
  compiler(callback) {
    let complication = new Complication(this.options)
    complication.build(callback)
  }
}

module.exports = Compiler
