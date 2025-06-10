const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Load environment variables from .env file
const dotenv = require('dotenv');
const envVars = dotenv.config().parsed || {};

console.log('🔧 Build time environment check:');
console.log(`FIGMA_PAT found: ${envVars.FIGMA_PAT ? 'Yes' : 'No'}`);
console.log(`FIGMA_PAT length: ${envVars.FIGMA_PAT ? envVars.FIGMA_PAT.length : '0'}`);
console.log(`FIGMA_PAT starts with figd_: ${envVars.FIGMA_PAT ? envVars.FIGMA_PAT.startsWith('figd_') : 'No'}`);

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: 'inline-source-map',

  entry: {
    ui: './src/ui.tsx',
    code: './src/code.ts',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                sourceMap: true
              }
            }
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      inject: 'body'
    }),
    new HTMLInlineScriptPlugin(),
    new webpack.DefinePlugin({
      'process.env.FIGMA_PAT': JSON.stringify(envVars.FIGMA_PAT)
    })
  ],
}); 