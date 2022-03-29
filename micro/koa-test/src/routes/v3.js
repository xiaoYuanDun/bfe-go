const fs = require('fs');
const path = require('path');

module.exports = {
  routes: [
    {
      path: '/get-file',
      mws: (ctx) => {
        const rs = fs.createReadStream(
          path.resolve(__dirname, '../../public/name.txt')
        );
        ctx.body = rs;
      },
    },
  ],
};
