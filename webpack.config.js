const path = require("path");
const webpackRxjsExternals = require("webpack-rxjs-externals");
module.exports = [{
    externals: [],
	output: {
        path: path.join(__dirname, "dist"),
        filename: 'datamatic.umd.js',
		libraryTarget: "umd",
	},
    module: {
    },
}, {
    externals: [],
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'datamatic.window.js',
        libraryTarget: "window",
        library: "datamatic",
    },
    module: {
    },
}, {
    externals: [
        // webpackRxjsExternals(),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "datamatic.node.js",
        libraryTarget: "commonjs",
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
