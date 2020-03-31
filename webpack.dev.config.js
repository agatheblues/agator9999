const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var webpack = require('webpack');

module.exports = {
  entry: ['./main.js'],
  output: {
    filename: 'bundle.js'
  },
  mode: 'development',
  devServer: {
    port: 8888,
    overlay: true
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'style.css' })
  ],
  stats: {
    children: false
  }
};
