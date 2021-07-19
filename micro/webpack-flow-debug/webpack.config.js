

module.exports = {
  mode: 'development',
  devtool: false,
  context: process.cwd(), // 上下文目录 ./src .默认代表根目录，默认值就是当前命令执行时候所在的目录
  entry: {
    entry1: './src/index.js',
    entry2: './src/index2.js',
  }
};
