module.exports = {
  prefix: '/system',
  routes: [
    {
      path: '/check/:name',
      mws: [
        (ctx, next) => {
          const whiteList = ['xiaoMing', 'danny', 'xiaoHong'];
          const name = ctx.params.name;

          if (!!~whiteList.indexOf(name)) {
            ctx.inWhite = true;
          }
          next();
        },
        (ctx) => {
          if (ctx.inWhite) {
            ctx.body = 'this is name in whiteList: ' + ctx.params.name;
          } else {
            ctx.body = ctx.params.name + ' not in org.';
          }
        },
      ],
    },
  ],
};
