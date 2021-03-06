const path = require('path')
const RunPlugin = require('./plugins/run-plugin')
const DownPlugin = require('./plugins/down-plugin')
const AssetsPlugin = require('./plugins/assets-plugin')

module.exports = {
  mode: 'development',
  devtool: false,
  context: __dirname, // 上下文目录 ./src .默认代表根目录，默认值就是当前命令执行时候所在的目录
  entry: {
    entry1: './src/index.js',
    entry2: './src/index2.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [new RunPlugin(), new DownPlugin(), new AssetsPlugin()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, 'loaders', 'logger1-loader.js'),
          path.resolve(__dirname, 'loaders', 'logger2-loader.js'),
        ],
      },
    ],
  },
}
