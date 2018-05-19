var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  entry: ['./main.js'],
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['transform-object-rest-spread']
        }
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: [/node_modules/],
        loader: 'eslint-loader',
        options: {
          // eslint options (if necessary)
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('style.css')
  ]
};
