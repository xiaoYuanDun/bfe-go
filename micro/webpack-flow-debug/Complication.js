const path = require('path')
const fs = require('fs')
class Complication {
  constructor(options) {
    this.options = options
    this.entries = [] // 存放所有的入口文件
    this.modules = [] // 存放所有的模块
    this.chunks = [] // 存放所有的代码块
    this.assets = [] // 存放所有的产出资源
    this.files = [] // 存放所有的产出文件
  }
  build(callback) {
    let entry = {}
    // 5. 根据配置中的 entry 找出入口文件
    if (typeof this.options.entry === 'string') {
      entry.main = this.options.entry
    } else {
      entry = this.options.entry
    }
    console.log(process.cwd())
    for (let entryName in entry) {
      // 获取entry1的绝对路径
      let entryFilePath = path.join(this.options.context, entry[entryName])
      //6. 从入口文件出发,调用所有配置的 Loader 对模块进行编译
      let entryModule = this.buildModule(entryName, entryFilePath)
    }
  }
  buildModule(name, modulePath) {
    // 6. 从入口文件出发,调用所有配置的 Loader 对模块进行编译
    // 1) 读取模块文件的内容
    let sourceCode = fs.readFileSync(modulePath, 'utf8')
    let rules = this.options.module.rules
    let loaders = []
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].test.test(modulePath)) {
        loaders = [...loaders, ...rules[i].use]
      }
    }
    for (let i = loaders.length - 1; i >= 0; i--) {
      let loader = loaders[i]
      sourceCode = require(loader)(sourceCode)
    }
    console.log(sourceCode)
  }
}

module.exports = Complication
