const path = require('path')
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('babel-types')
const baseDir = toUnitPath(process.cwd())

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
      let entryFilePath = toUnitPath(path.join(this.options.context, entry[entryName]))
      //6. 从入口文件出发,调用所有配置的 Loader 对模块进行编译
      let entryModule = this.buildModule(entryName, entryFilePath)
      this.modules.push(entryModule)
    }
    console.log(this.modules)
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

    // 2) 对代码进行转换
    let moduleId = './' + path.posix.relative(baseDir, modulePath)
    let module = { id: moduleId, dependencies: [], name }
    let ast = parser.parse(sourceCode, { sourceType: 'module' })
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === 'require') {
          let moduleName = node.arguments[0].value // ./title1
          // 获取当前模块的所属目录
          let dirname = path.posix.dirname(modulePath)
          let depModulePath = path.posix.join(dirname, moduleName)
          let extensions = this.options.resolve.extensions
          depModulePath = tryExtension(depModulePath, extensions)
          // 得到依赖的模块id ./src/index.js
          const depModuleId = path.posix.relative(baseDir, depModulePath)
          // require('./index) => require('./src/index.js)
          node.arguments = [types.stringLiteral(depModuleId)]
          // 依赖的模块id放到当前模块的依赖数组里
          module.dependencies.push(depModulePath)
        }
      }
    })
    // 生成新的代码
    let code = generator(ast)
    module._source = code // 模块源代码指向语法树转换后新生成的源代码
    // 7. 再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    module.dependencies.forEach((depModulePath) => {
      let dependencyModule = this.buildModule(name, depModulePath)
      this.modules.push(dependencyModule)
    })
    return module
  }
}

function tryExtension(modulePath, extensions) {
  extensions.unshift('') // 可能路径本身就带有.js
  for (let extension of extensions) {
    let newPath = modulePath + extension
    if (fs.existsSync(newPath)) {
      return newPath
    }
  }
  throw new Error('module not found')
}

function toUnitPath(path) {
  return path.replace(/\\/g, '/')
}

module.exports = Complication
