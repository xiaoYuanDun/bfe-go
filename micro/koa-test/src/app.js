const Koa = require('../implement'); // const Koa = require('koa');
const routeMiddleware = require('./routes');

const app = new Koa();

app.use(routeMiddleware);

app.listen(3333);
console.log('listen on 3333');
