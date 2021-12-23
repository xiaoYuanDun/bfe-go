const Koa = require('koa');
// const Koa = require('./mykoa');

const app = new Koa();

// example-0
//
// app.use(async (ctx, next) => {
//   console.log('1');
//   await new Promise((resolve) => {
//     setTimeout(resolve, 1500);
//   });
//   await next();
//   await new Promise((resolve) => {
//     setTimeout(resolve, 1500);
//   });
//   console.log('2');
// });

// app.use(async (ctx, next) => {
//   await new Promise((resolve) => {
//     setTimeout(resolve, 1500);
//   });
//   console.log('3');
//   await next();
//   await new Promise((resolve) => {
//     setTimeout(resolve, 1500);
//   });
//   console.log('4');
// });

// app.use(async (ctx) => {
//   ctx.body = 'h1i';
// });

// app.listen(3000);

// example-1
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
