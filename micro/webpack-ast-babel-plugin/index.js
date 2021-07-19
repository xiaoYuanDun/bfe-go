const babelCore = require('@babel/core')
const types = require('babel-types')
const BabelPluginTransformEs2015ArrowFunctions = require('babel-plugin-transform-es2015-arrow-functions');
const sourceCode = `
const sum = (a,b)=>{
    console.log(this);
    return a+b;
}`
//babel插件其实是一个对象，它会有一个visitor访问器
const BabelPluginTransformEs2015ArrowFunctions2 = {
  //每个插件都会有自己的访问器
  visitor: {
    //属性就是节点的类型，babel在遍历到对应类型的节点的时候会调用此函数
    ArrowFunctionExpression(nodePath) {
      const node = nodePath.node
      // 通过修改type改变箭头函数
      node.type = 'FunctionExpression'
      // 改变this指向
      hoistFunctionEnvironment(nodePath)
    }

  }
}

const hoistFunctionEnvironment = (nodePath) => {
  const thisEnvFn = nodePath.findParent(p => {
    return (p.isFunction() && !p.isArrowFunctionExpression()) || p.isProgram()
  })
  // 找一找当前作用域哪些地方用到了this的路径
  const thisPaths = getThisScopeInfo(nodePath)
  //声明了一个this的别名变量，默认是_this __this
  let thisBinding = '_this';
  if (thisPaths.length) {
    //在thisEnvFn的作用域内添加一个变量，变量名_this,初始化的值为this
    thisEnvFn.scope.push({
      id: types.identifier(thisBinding),
      init: types.thisExpression()
    });
    thisPaths.forEach((item) => {
      //创建一个_this的标识符  
      let thisBindingRef = types.identifier(thisBinding);
      //把老的路径 上的节点替换成新节点
      item.replaceWith(thisBindingRef);
    })
  }
}

function getThisScopeInfo(nodePath) {
  let thisPaths = []
  //遍历当前path所有的子节点路径，
  //告诉 babel我请帮我遍历fnPath的子节点，遇到ThisExpression节点就执行函数，并且把对应的路径传进去 
  nodePath.traverse({
    ThisExpression(thisPath) {
      thisPaths.push(thisPath)
    }
  })
  return thisPaths
}

const targetCode = babelCore.transform(sourceCode, {
  plugins: [BabelPluginTransformEs2015ArrowFunctions2]
})

console.log(targetCode.code)