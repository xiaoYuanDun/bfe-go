const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StateWrapPlugin = require('../plugins/StateWrapPlugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.[fullhash:8].js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  devServer: {
    port: 3000,
    //  是否展示进度条
    progress: true,
    //  静态服务器根路径
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
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
    new CleanWebpackPlugin(),
    new StateWrapPlugin({
      version: 1,
    }),
  ],
};
