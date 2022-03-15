const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  // mode: 'production',

  // normal
  // entry: './src/index.js',

  // 测试 hash
  // entry: {
  //   main: './src/index.js',
  //   vendor: ['lodash'],
  // },

  // tree-shaking
  entry: './src/index2.js',

  // 查看 source-map
  entry: './src/index-sourcemap.js',

  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, '../dist'),
    clean: true,
  },
  devtool: 'cheap-source-map', // source-map, eval, cheap
  resolve: {
    extensions: ['.js', '.jsx'],
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
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
    }),
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: 'buffer',
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
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(less|css)$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
      // `...`,
      new CssMinimizerPlugin(),
    ],
    minimize: true,
  },
};
