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
    this.assets = {} // 存放所有的产出资源
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
      // 8. 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
      // entryModule 是入口的模块，modules是依赖的模块
      let chunk = { name: entryName, entryModule, modules: this.modules.filter(item => item.name === entryName) }
      this.entries.push(chunk)
      this.chunks.push(chunk)
    }
    // 9. 再把每个 Chunk 转换成一个单独的文件加入到输出列表
    this.chunks.forEach(chunk => {
      let filename = this.options.output.filename.replace('[name]', chunk.name)
      // this.assets就是输出列表，key就是文件名，值就是输出内容
      this.assets[filename] = getSource(chunk)
    })
    // 10. 在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
    this.files = Object.keys(this.assets)
    for (let file of this.files) {
      const filePath = path.join(this.options.output.path, file)
      fs.writeFileSync(filePath, this.assets[file], 'utf8')
    }
    callback(null, {
      toJson: () => ({
        entries: this.entries,
        chunks: this.chunks,
        modules: this.modules,
        files: this.files,
        assets: this.assets
      })
    })
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
          // 相对于项目根目录 的相对路径 ./src/title1.js
          const depModuleId = './' + path.posix.relative(baseDir, depModulePath)
          // require('./index) => require('./src/index.js)
          node.arguments = [types.stringLiteral(depModuleId)]
          // 依赖的模块id放到当前模块的依赖数组里
          module.dependencies.push(depModulePath)
        }
      }
    })
    // 生成新的代码
    let { code } = generator(ast)

    module._source = code // 模块源代码指向语法树转换后新生成的源代码
    // 7. 再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    module.dependencies.forEach((depModulePath) => {
      let dependencyModule = this.buildModule(name, depModulePath)
      this.modules.push(dependencyModule)
    })
    return module
  }
}

function getSource(chunk) {
  return `
  (() => {
      var modules = ({
          ${chunk.modules.map(module => `
                  "${module.id}":(module,exports,require)=>{
                      ${module._source}
                  }
              `).join(',')
    }
      });
      var cache = {};
      function require(moduleId) {
        var cachedModule = cache[moduleId];
        if (cachedModule !== undefined) {
          return cachedModule.exports;
        }
        var module = cache[moduleId] = {
          exports: {}
        };
        modules[moduleId](module, module.exports, require);
        return module.exports;
      }
      var exports = {};
      (() => {
       ${chunk.entryModule._source}
      })();
    })()
      ;
  `
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
