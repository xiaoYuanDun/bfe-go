console.log('child1 ...');

process.on('message', (data) => {
  process.send(data + 222);
});
