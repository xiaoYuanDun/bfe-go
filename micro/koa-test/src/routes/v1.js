module.exports = (router) => {
  router.get('/', (ctx) => {
    ctx.body = 'good';
  });

  router.get('/get-err', (ctx) => {
    ctx.throw(404, '无这个资源');
  });
};
