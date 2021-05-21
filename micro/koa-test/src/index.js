// const Koa = require('koa');
const Koa = require('./mykoa');

const app = new Koa();

app.use(async (ctx, next) => {
  console.log('1');
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  await next();
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  console.log('2');
});

app.use(async (ctx, next) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  console.log('3');
  await next();
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  console.log('4');
});

app.use(async (ctx) => {
  ctx.body = 'h1i';
});

app.listen(3000);
