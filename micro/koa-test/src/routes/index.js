const requireDirectory = require('require-directory');
// const Router = require('koa-router');
const Router = require('../../implement/router');

const router = new Router();

requireDirectory(module, __dirname, {
  visit: (routeConfig) => {
    const { prefix = '', routes = [] } = routeConfig;

    routes.forEach(({ method = 'get', path, mws }) => {
      const curMws = Array.isArray(mws) ? mws : [mws];
      router[method](prefix + path, ...curMws);
    });
  },
});

module.exports = router;

// ---------- v1 版本，路由需要这样写，比较丑陋
// -----------------------------------------------------------------------------
// app.use(async (ctx, next) => {
//   // get-hello
//   // get-file
//   // get-err
//   if (ctx.req.url === '/get-hello') {
//     ctx.body = 'hello';
//   } else if (ctx.req.url === '/get-file') {
//     const rs = fs.createReadStream(
//       path.resolve(__dirname, './public/name.txt')
//     );
//     ctx.body = rs;
//   } else if (ctx.req.url === '/get-err') {
//     ctx.throw(404, '无这个资源');
//   } else {
//     ctx.body = 'other opt';
//   }
// });

// ---------- v2 版本，已经把所有路由提取到 routes/index.js 里了
// ---------- 但这里有个问题，兜底路由没办法配置
// -----------------------------------------------------------------------------
// router.get('/', (ctx) => {
//   // ctx.router available
//   ctx.body = 'good';
// });

// router.get('/get-hello', (ctx) => {
//   ctx.body = 'hello';
// });

// router.get('/get-file', (ctx) => {
//   const rs = fs.createReadStream(
//     path.resolve(__dirname, '../../public/name.txt')
//   );
//   ctx.body = rs;
// });

// router.get('/get-err', (ctx) => {
//   ctx.throw(404, '无这个资源');
// });

// ---------- v3 版本，把路由分散都更细粒度的文件中
// -----------------------------------------------------------------------------
// v1, v2, v3, ...
// 借助 require-directory 读取非 index 文件中注册的路由配置
// 因为不想在每个 route 文件中都产生新的 router 实例，所以在 index 中实例化一个 router
// 然后把此 router 传给每个 route 配置
