import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';

// 使用 require 语法不需要指定
// const code = `
// 	const _ = require('lodash');
// `;
// const ast = parse(code);

// 使用 import 语句需要指定 parse 的 sourceType: 'module'
const code = `
	import { get } from 'lodash';
`;
const ast = parse(code, {
  sourceType: 'module',
});

const trav = {
  enter(path) {
    // console.log(path);
  },
};

traverse(ast, trav);
console.log('ast', ast);

const newCode = generator(ast);
console.log('newCode', newCode.code);
