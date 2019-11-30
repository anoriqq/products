const path = require('path');
const nodeExternals = require('webpack-node-externals');

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'source-map',
  entry: {
    'bundle.js': path.resolve(process.env.PRODUCT_DIR, 'server/src/index.ts'),
  },
  output: {
    filename: '[name]',
    path: path.resolve(process.env.PRODUCT_DIR, 'server/dist'),
    libraryTarget: 'commonjs2',
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
