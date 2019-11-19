const path = require('path');

module.exports = {
  mode: 'development',
  target: 'web',
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'source-map',
  entry: {
    'bundle.js': path.resolve(process.env.WORKDIR, 'src/client/index.ts'),
  },
  output: {
    filename: '[name]',
    path: path.resolve(process.env.WORKDIR, 'dist/public/js'),
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|dist)/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.pug$/,
        oneOf: [
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
          {
            use: ['raw-loader', 'pug-plain-loader']
          }
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
