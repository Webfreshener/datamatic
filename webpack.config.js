const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = [{
    context: path.join(__dirname),
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'jsd.js',
        library: 'JSD',
        libraryTarget: 'umd'
    }
}, {
    context: path.join(__dirname),
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'jsd.min.js'
    },
    plugins: [
        new UglifyJsPlugin()
    ]
}];
