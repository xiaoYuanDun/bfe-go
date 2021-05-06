#! /usr/bin/env node

const program = require('commander');

const arg = program.parse(process.argv);

console.log('process.argv', process.argv);
console.log('arg', arg);
