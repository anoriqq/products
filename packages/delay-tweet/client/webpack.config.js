const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

console.log('PATH: ', path.resolve(process.env.PRODUCT_DIR, 'src/client/index.ts'));

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  entry: {
    'bundle.js': path.resolve(process.env.PRODUCT_DIR, 'src/client/index.ts'),
  },
  output: {
    path: path.resolve(process.env.PRODUCT_DIR, 'dist/public/js'),
    filename: '[name]',
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules|dist)/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.vue$/,
        exclude: /(node_modules|dist)/,
        loader: 'vue-loader'
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
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
