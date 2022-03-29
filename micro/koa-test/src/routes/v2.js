module.exports = {
  routes: [
    {
      path: '/get-hello',
      mws: (ctx) => {
        ctx.body = 'hello';
      },
    },
    {
      path: '/get-person/:name',
      mws: (ctx) => {
        ctx.body = 'hello ' + ctx.params.name;
      },
    },
  ],
};
