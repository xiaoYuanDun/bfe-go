const { createServer } = require('http');

let subServer = createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('handled by child, pid is ' + process.pid + '\n');
  throw new Error('throw exception');
});

let worker;
process.on('message', function (m, tcp) {
  if (m === 'server') {
    worker = tcp;
    tcp.on('connection', function (socket) {
      subServer.emit('connection', socket);
    });
  }
});

process.on('uncaughtException', function () {
  // 发送自杀信号
  process.send({ act: 'suicide' });

  // 停止接收新的连接
  worker.close(function () {
    // 所有已有连接断开后，退出进程
    process.exit(1);
  });

  setTimeout(function () {
    process.exit(1);
  }, 5000);
});
