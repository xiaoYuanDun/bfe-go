const mime = require('mime');
const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');

const getContentType = (filePath) =>
  mime.getType(filePath) ? mime.getType(filePath) : 'text/html';

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://xxx');

  const filePath = path.join(__dirname, '../public', pathname);

  // 强缓存
  console.log('ppp', pathname);
  res.setHeader('Cache-Control', 'max-age=10');

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.statusCode = 404;
      res.end('NOT FOUND');
    } else {
      if (stat.isFile()) {
        res.setHeader(
          'Content-type',
          `${getContentType(filePath)};charset=utf-8`
        );
        fs.createReadStream(filePath).pipe(res);
      } else {
        const defaultPath = path.join(filePath, 'index.html');
        fs.access(defaultPath, (err) => {
          if (err) {
            res.statusCode = 404;
            res.end('NOT FOUND');
          } else {
            res.setHeader(
              'Content-type',
              `${getContentType(filePath)};charset=utf-8`
            );
            fs.createReadStream(defaultPath).pipe(res);
          }
        });
      }
    }
  });
});

server.listen(3000, () => {
  console.log('server start at: 3000');
});
