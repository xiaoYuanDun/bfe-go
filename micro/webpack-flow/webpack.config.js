// const webpack = require('webpack');
// const html = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  // resolve: {
  //   fallback: {
  //     crypto: require.resolve('crypto-browserify'),
  //     https: require.resolve('https-browserify'),
  //     http: require.resolve('stream-http'),
  //     os: require.resolve('os-browserify'),
  //     stream: require.resolve('stream-browserify'),
  //     assert: require.resolve('assert/'),
  //     path: require.resolve('path-browserify'),
  //     buffer: require.resolve('buffer/'),
  //     url: require.resolve('url/'),
  //     vm: require.resolve('vm-browserify'),
  //     constants: require.resolve('constants-browserify'),
  //     fs: require.resolve('fs-extra'),
  //     worker_threads: require.resolve('node-worker-threads-pool'),
  //     inspector: require.resolve('inspector'),
  //   },
  // },
  plugins: [
    // new webpack.ProvidePlugin({
    //   fs: 'fs-extra',
    //   worker_threads: 'node-worker-threads-pool',
    //   inspector: 'inspector',
    // }),
    // new html(),
  ],
};
