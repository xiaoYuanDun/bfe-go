const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const smw = new SpeedMeasureWebpackPlugin();

module.exports = smw.wrap({
  mode: 'development',
  entry: './src/index.js',
  devtool: false,

  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
    }),
  ],
});
