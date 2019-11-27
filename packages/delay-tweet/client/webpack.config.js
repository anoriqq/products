const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src'),
    ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@src': path.resolve(process.env.PRODUCT_DIR, 'client/src'),
    },
  },
  entry: {
    'bundle.js': path.resolve(process.env.PRODUCT_DIR, 'client/src/index.ts'),
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
        options: {
          appendTsSuffixTo: [/\.vue$/],
          configFile: path.resolve(process.env.PRODUCT_DIR, 'client/tsconfig.json'),
        },
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
      },{
      test: /\.s(c|a)ss$/,
      use: [
        'vue-style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass'),
            fiber: require('fibers'),
            indentedSyntax: true
          },
          options: {
            implementation: require('sass'),
            sassOptions: {
              fiber: require('fibers'),
              indentedSyntax: true
            },
          },
        },
      ],
    },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
