/** @type import('webpack').Configuration */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  target: 'web',
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src'),
    ],
    alias: {
      '@src': path.resolve(process.env.PRODUCT_DIR, 'client/src'),
    },
  },
  entry: {
    'bundle.js': path.resolve(process.env.PRODUCT_DIR, 'client/src/index.tsx'),
  },
  output: {
    path: path.resolve(process.env.PRODUCT_DIR, 'client/dist/js'),
    filename: '[name]',
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules|dist)/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [],
};
