### node 多进程

直接上代码

```js
// index.js (master)
const { fork } = require('child_process');
const { resolve } = require('path');
const { createServer } = require('net');

const server = createServer();

const child1 = fork(resolve(__dirname, './worker.js'));
const child2 = fork(resolve(__dirname, './worker.js'));

server.on('connection', function (socket) {
  console.log('connection');
  socket.end('handled by parent\n');
});

server.listen(1337, function () {
  console.log(`parent listen, pid: ${process.pid}`);
  child1.send('server', server);
  child2.send('server', server);
  //   server.close();
});

// worker.js
const { createServer } = require('http');

var subServer = createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('handled by child, pid is ' + process.pid + '\n');
});

process.on('message', function (m, tcp) {
  if (m === 'server') {
    tcp.on('connection', function (socket) {
      subServer.emit('connection', socket);
    });
  }
});
```

运行 `node index.js`, 会启动一个 net 服务, 监听 1337 端口后, 把 server 实例发送给两个子进程, 这是如果接受到 1337 的请求, master 和 worker 中的 server 都有可能得到处理机会, 如果把 server 实例发给子进程后, 关闭 master server (server.close()), 则这时有 1337 的新请求到来时, 只有 worker 中的 http server 会得到处理机会

[node 官网传送门](http://nodejs.cn/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback)
[原理分析](https://segmentfault.com/a/1190000014701988)

`process.send('xxx', handle)` 再被发送到 IPC 之前, 会组装一个新的 message 对象:

```js
message = {
  cmd: 'NODE_HANDLE',
  type: 'net.Server',
  msg: message,
};
```

而且, send 方法并不会真正的发送一个对象
使用 `send('xxx', handle)` 发送信息到 IPC, 实际发送的内容是经过 JSON.strigify 的原始信息 和 句柄文件描述符, 在发送句柄时, 也不会真正的发送这个句柄对象, 子进程会从 IPC 中反序列化(JSON.parse)出 message 对象, 使用 message.type 和 句柄文件描述符, 重新还原出一个对应的对象

通过发送 server 句柄的方式, 可以在多个子进程中还原出多个 socket 对象, 并且这些 socket 对象都指向一个相同的文件描述符, 就解决了多个进程监听同意端口会报错的问题了, 但是一个文件描述符同意时间只能被一个进程使用, 也就是说一个网络请求到来时, 只有一个子进程可以抢占到这次服务机会

关于 '通过 net/http 创建的服务进程',
我理解是 每次通过 createServer 创建一个 server, 然后调用 server.listen(80), 这时, 表面上看是 server 实例监听了 80 端口, 实际上 server 内部创建了一个 socket 套接字实例 来监听 80 端口, 我们在开发中经常遇到的 `EADDRINUSE` 异常, 就是因为某个端口对应的 socket 的文件描述符 和 出错的服务所使用的的 socket 实例 的文件描述符 不相同导致的(默认情况下, 同一个端口, 只能又一个进程来监听, 对应一个 socket 文件描述符)

cluster 模块对这套架构做了一下封装和加强, 创建 master 的同时, 加入了负载均衡, 进程监控等逻辑, 不过核心都是使用 传递句柄 的方法, 而且 cluster 的子进程中如果使用 listen, 实际是没有效果的, 有一点区别需要注意一下, 上面的结构中, 我们是首先在 master 中创建 server, 并且调用 listen 监听端口, 然后通过 send 把 server 发送给子进程, 子进程从 IPC 中得到信息, 还原 server, 得到 masterServer 的 socket 句柄, 但是在 cluster 的官方例子中, 端口的监听是放在子进程逻辑中的:

```js
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接
  // 在本示例中，其是 HTTP 服务器
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

可以看到 master 逻辑只是单纯创建了一个 server, 而监听工作在子进程逻辑里, 实际上, 由 cluster fork 生成的子进程在调用 listen 的时候, 会首先判断一下当前的执行环境, 是 master 还是 worker, 如果是 worker, 则会通过 IPC 向 master 发送一个 `queryServer` 的消息, 通知 master 调用真正的 listen 监听指定的端口, master 在收到这个消息后, 看一下这个端口是否已经被监听, 如果没有, 则开启监听, 如果已经存在监听, 就把句柄绑定到这个监听上(而 masterServer 的 socket 句柄又会通过 IPC 发送给子进程), 子进程环境下的 listen 本身就是个空方法(所以多个进程写了同一个端口逻辑, 也不会报错, 因为这时 listen 没有做任何工作), 算是个 master 环境下的 **hack**

首次 listen 会创建 masterServer 并监听端口, 之后来了请求, 就是被 masterServer 接收到, 然后按情况负载分配到每个 worker 中

其实两种方式都实现的相同的架构, 只是使用的方法和方法的时机不同罢了

### TODO egg-cluster
