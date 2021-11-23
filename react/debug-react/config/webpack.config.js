const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      //  模板位置
      template: path.resolve(__dirname, '../template/index.html'),
      //  输出名
      filename: 'index.html',
      //  是否压缩模板
      minify: true,
      hash: true,
    }),
  ],
  devServer: {
    port: 3000,
    //  是否展示进度条
    progress: true,
    //  静态服务器根路径
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
};
