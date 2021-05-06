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

  // last-modifed 协商缓存
  res.setHeader('Cache-Control', 'no-cache');
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.statusCode = 404;
      res.end('NOT FOUND');
    } else {
      if (stat.isFile()) {
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
          fs.createReadStream(filePath).pipe(res);
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
