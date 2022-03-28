const fs = require('fs');
const path = require('path');
const Koa = require('../implement');
// const Koa = require('koa');

const router = require('./routes');

const app = new Koa();

app.use(router.routes());

app.listen(3333);
console.log('listen on 3333');
