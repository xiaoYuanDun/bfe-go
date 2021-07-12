const path = require('path');
const MFP = require('webpack/lib/container/ModuleFederationPlugin');
const HWP = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    filename: '[name]_r1.[chunkhash:8].js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  devServer: {
    port: 3000,
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HWP({
      template: './template.html',
    }),
    new MFP({
      filename: 'remoteEntry.js',
      name: 'remote_1',
      exposes: {
        './newsList': './src/NewsList',
      },
      remotes: {
        remote_host: 'remote_host@http://localhost:3001/remoteEntry.js',
        remote_2: 'remote_2@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
        },
      },
    }),
  ],
};
