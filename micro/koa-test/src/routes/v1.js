module.exports = {
  routes: [
    {
      path: '/',
      mws: (ctx) => {
        ctx.body = 'good';
      },
    },
    {
      path: '/get-err',
      mws: (ctx) => {
        ctx.throw(404, '无这个资源');
      },
    },
  ],
};
