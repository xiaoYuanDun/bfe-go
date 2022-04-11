const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'bundle-[fullhash:8].js',
    path: path.resolve(__dirname, '../dist'),
    library: 'app-user',
    libraryTarget: 'umd',
  },
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
      // minify: true,
      // hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'style-[fullhash:8].css',
    }),
    new CleanWebpackPlugin(),
  ],
  devServer: {
    port: 3002,
    //  静态服务器根路径
    static: {
      directory: path.resolve(__dirname, '../dist'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.less?$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
          },
          'less-loader',
        ],
      },
    ],
  },
};
