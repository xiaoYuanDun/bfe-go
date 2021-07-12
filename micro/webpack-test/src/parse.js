import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import * as t from '@babel/types';

const code = `
    const arrow = count => this.name + 10
`;

// before
// const arrow = (count) => this.name + 1;

// after
// var _this = this
// var arrow = function(count) {
// 	return _this.name + 10
// }

// ------------------------------------------------------
// ------------------------------------------------------

// 把 a + b 运算全部变成 (a + 1) * b
const trav = {
  // enter(nodePath) {
  //   console.log('nodePath', nodePath);
  // },
  BinaryExpression(nodePath) {
    const { node } = nodePath;
    if (node.operator === '+') {
      // 处理 + 左边节点
      if (
        t.isMemberExpression(node.left) &&
        t.isThisExpression(node.left.object)
      ) {
        // node.left = t.binaryExpression(
        //   '+',
        //   t.memberExpression(t.identifier('_this'), node.left.property),
        //   t.numericLiteral(1)
        // );
        // node.operator = '*';
      } else {
        // node.left = t.binaryExpression('+', node.left, t.numericLiteral(1));
      }
    }
  },
  MemberExpression(nodePath) {
    const { node } = nodePath;
    // 确定当前节点是一个 + 操作符的左边节点
    if (
      nodePath.parent &&
      nodePath.parent.operator === '+' &&
      nodePath.parent.left === node
    ) {
      if (t.isMemberExpression(node)) {
        // 处理 this
        if (t.isThisExpression(node.object)) {
          const newLeft = t.binaryExpression(
            '+',
            t.memberExpression(t.identifier('_this'), node.property),
            t.numericLiteral(1)
          );
          nodePath.replaceWith(newLeft);

          // 处理 _this 的添加位置
          // 作用域只有函数作用域和全局两种
          const parent = nodePath.findParent(
            (path) =>
              (path.isFunction() && !path.isArrowFunctionExpression()) ||
              path.isProgram()
          );
          parent.scope.push({
            id: t.identifier('_this'),
            init: t.thisExpression(),
          });
          console.log('parent', parent);
        } else {
          // 处理普通变量
        }
        if (!nodePath.parent.skip) {
          nodePath.parent.operator = '*';
          nodePath.parent.skip = true;
        }
      }
    }
  },
};

// console.log(t.ThisExpression('nnn'));

// console.log(t.identifier('haha'));

const ast = parse(code);

traverse(ast, trav);
console.log('ast', ast);

const newCode = generator(ast);
console.log('newCode', newCode.code);

export default 'parse';
