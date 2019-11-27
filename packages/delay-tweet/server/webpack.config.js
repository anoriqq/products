const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'source-map',
  entry: {
    'bundle.js': path.resolve(process.env.WORKDIR, 'src/server/index.ts'),
  },
  output: {
    filename: '[name]',
    path: path.resolve(process.env.WORKDIR, 'dist/server'),
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|dist)/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
