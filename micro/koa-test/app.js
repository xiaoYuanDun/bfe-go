const fs = require('fs');
const path = require('path');

const Koa = require('./src/index.js');

const app = new Koa();

app.use(async (ctx, next) => {
  // console.log('if', res.headersSent);
  // res.setHeader('X-Foo', 'bar');
  // res.writeHead(200, { 'Content-Type': 'application/json' }).end();
  // console.log('if', res.headersSent);
  // return;
  // ctx.res.writeHead(200, { 'Content-Type': 'application/json' });
  // ctx.res.end(
  //   JSON.stringify({
  //     data: 'Hello World!',
  //   })
  // );

  // get-hello
  // get-file
  // get-err

  if (ctx.req.url === '/get-hello') {
    ctx.body = 'hello';
  } else if (ctx.req.url === '/get-file') {
    const rs = fs.createReadStream(
      path.resolve(__dirname, './public/name.txt')
    );
    ctx.body = rs;
  } else if (ctx.req.url === '/get-err') {
    ctx.throw(404, '无这个资源');
  } else {
    ctx.body = 'other opt';
  }
});

app.listen(3333);
