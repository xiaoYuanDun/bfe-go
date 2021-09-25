const { fork } = require('child_process');
const { resolve } = require('path');
const { cpus: getCpus } = require('os');
const { createServer } = require('net');

var cpus = getCpus();
var server = createServer();
server.listen(1337);
var workers = {};

console.log('cpus', cpus.length);

var createWorker = function () {
  var worker = fork(resolve(__dirname, './worker.js'));

  worker.on('message', function (message) {
    // 接受到自杀新号, 立即重启一个子进程
    if (message.act === 'suicide') {
      createWorker();
    }
  });

  // 监听 exit 事件, 退出时重新启动新的进程
  worker.on('exit', function () {
    console.log('Worker ' + worker.pid + ' exited.');
    delete workers[worker.pid];
  });

  // 句柄转发
  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log('Create worker. pid: ' + worker.pid);
};

for (var i = 0; i < cpus.length; i++) {
  createWorker();
}

// 进程自己退出时，让所有工作进程退出
process.on('exit', function () {
  for (var pid in workers) {
    workers[pid].kill();
  }
});

// const server = createServer();

// const child1 = fork(resolve(__dirname, './worker.js'));
// const child2 = fork(resolve(__dirname, './worker.js'));

// server.on('connection', function (socket) {
//   console.log('connection');
//   socket.end('handled by parent\n');
// });

// server.listen(1337, function () {
//   console.log(`parent listen, pid: ${process.pid}`);
//   child1.send('server', server);
//   child2.send('server', server);
//   server.close();
// });
