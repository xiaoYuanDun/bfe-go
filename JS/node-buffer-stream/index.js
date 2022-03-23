const fs = require('fs');
const path = require('path');

const rs = fs.createReadStream(path.resolve(__dirname, 'from/bg-img.jpg'));

const ws = fs.createWriteStream(path.resolve(__dirname, 'to/target.jpg'));

let buf = '';

rs.on('data', function (data) {
  // ws.write(data);

  console.log('-', data);
});

rs.on('end', function () {
  console.log('end', buf);
});

// rs.pipe(ws);
