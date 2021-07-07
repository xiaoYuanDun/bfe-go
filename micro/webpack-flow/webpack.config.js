const zipPlugin = require('./plugins/zip');

module.exports = {
  mode: 'development',
  entry: './src/index.js',

  plugins: [new zipPlugin()],
};
