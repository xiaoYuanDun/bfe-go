let babel = require("@babel/core");
let types = require("babel-types");

const visitor = {
  ImportDeclaration: {
    // 第二个参数传入的是插件配置的第二个参数
    enter(path, state = { opts }) {
      const specifiers = path.node.specifiers; // 导入标识符
      // console.log(specifiers)
      const source = path.node.source; // 模块的名字lodash
      // console.log(source.value) // lodash
      // 如果不是默认导入
      if (state.opts.libraryName == source.value && !types.isImportDefaultSpecifier(specifiers[0])) {
        const ImportDeclarations = specifiers.map((specifier, index) => {
          return types.importDeclaration([types.importDefaultSpecifier(specifier.local)], types.stringLiteral(`${source.value}/${specifier.local.name}`)) // lodash/flatten
        })
        path.replaceWithMultiple(ImportDeclarations)
      }
    }
  }
}

module.exports = function (babel) {
  return {
    visitor
  }
}