const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        // libraryTarget: 'var',
        path: path.resolve(__dirname, 'dist'),
        filename: 'jsd.js',
        library: 'JSD',
        libraryTarget: 'umd'
    }
};
