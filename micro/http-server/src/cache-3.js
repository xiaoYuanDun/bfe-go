const mime = require('mime');
const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const getContentType = (filePath) =>
  mime.getType(filePath) ? mime.getType(filePath) : 'text/html';

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://xxx');

  const filePath = path.join(__dirname, '../public', pathname);

  res.setHeader('Cache-Control', 'no-cache');
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.statusCode = 404;
      res.end('NOT FOUND');
    } else {
      if (stat.isFile()) {
        // 缓存
        const ctime = stat.ctime.toUTCString();
        const lastModife = req.headers['if-modified-since'];
        if (ctime === lastModife) {
          res.statusCode = 304;
          res.end();
        } else {
          res.setHeader('Last-Modified', ctime);
          res.setHeader(
            'Content-type',
            `${getContentType(filePath)};charset=utf-8`
          );

          // 测试 gzip
          // 压缩
          const zip = req.headers['accept-encoding'];
          if (!!~zip.indexOf('gzip')) {
            const zipSteam = zlib.createGzip();
            res.setHeader('Content-Encoding', 'gzip');
            fs.createReadStream(filePath).pipe(zipSteam).pipe(res);
            return;
          } else {
            fs.createReadStream(filePath).pipe(res);
          }
          // fs.createReadStream(filePath).pipe(res);
        }
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
