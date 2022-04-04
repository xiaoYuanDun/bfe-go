const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ProvidePlugin } = require('webpack')

module.exports = {
  mode: 'development',
  entry: './index.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
    // libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: 3000,
    // open: true,
    //  静态服务器根路径
    static: {
      directory: path.resolve(__dirname, '../dist'),
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
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
  ],
  externals: {
    'react': 'React',
    // 'react-dom': {
    //   commonjs: 'react-dom', // 这里更改了
    //   commonjs2: 'react-dom', // 这里更改了
    //   amd: 'react-dom', // 这里更改了
    //   root: 'reactDom'
    // }
  },
};
