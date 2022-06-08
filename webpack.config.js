const path = require('path');
module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.jsx', '.js' ]
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
};