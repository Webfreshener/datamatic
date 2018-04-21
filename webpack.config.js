const path = require("path");
const webpack = require("webpack");
const webpackRxjsExternals = require("webpack-rxjs-externals");
module.exports = [{
    externals: [
        webpackRxjsExternals(),
    ],
	output: {
        path: path.join(__dirname, "dist"),
        filename: 'rxvo.js',
		libraryTarget: "umd",
		library: "RxVO",
	},
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
        ],
    },
}, {
    externals: [
        webpackRxjsExternals(),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'rxvo.node.js',
        libraryTarget: "commonjs",
        library: "RxVO",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
}];
