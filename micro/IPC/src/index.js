// const startCluster = require('egg-cluster').startCluster;

// startCluster({}, () => {
//   console.log('started ...');
// });

// var { exec, spawn, fork } = require('child_process');

// // const child = spawn('node', [__dirname + '/child1.js']);
// const child = fork(__dirname + '/child1.js');

// child.send('111');

// child.on('message', (data) => {
//   console.log(data);
// });

const { spawn } = require('child_process');

// 子进程将使用父进程的标准输入输出。
// spawn('ls');
spawn('ls', [], { stdio: 'inherit' });
// spawn('ls', [], { stdio: ['pipe', 'pipe', process.stderr] });
// spawn('ls', [], { stdio: ['pipe', null, null, null, 'pipe'] });
