module.exports = (router) => {
  router.get('/get-hello', (ctx) => {
    ctx.body = 'hello';
  });

  router.get('/get-person/:name', (ctx) => {
    ctx.body = 'hello ' + ctx.params.name;
  });
};
