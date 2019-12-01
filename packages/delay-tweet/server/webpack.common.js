/** @type import('webpack').Configuration */
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: {
    'bundle.js': path.resolve(process.env.PRODUCT_DIR, 'server/src/index.ts'),
  },
  output: {
    filename: '[name]',
    path: path.resolve(process.env.PRODUCT_DIR, 'server/dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules|dist)/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: [nodeExternals()],
};
