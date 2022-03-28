const fs = require('fs');
const path = require('path');

module.exports = (router) => {
  router.get('/get-file', (ctx) => {
    const rs = fs.createReadStream(
      path.resolve(__dirname, '../../public/name.txt')
    );
    ctx.body = rs;
  });
};
