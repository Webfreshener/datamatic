const path = require("path");
const webpack = require("webpack");
const webpackRxjsExternals = require("webpack-rxjs-externals");
module.exports = [{
    externals: [
        webpackRxjsExternals(),
    ],
	output: {
        path: path.join(__dirname, "dist"),
        filename: 'datalux.js',
		libraryTarget: "umd",
		library: "datalux",
	},
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use: {
            //         loader: "babel-loader"
            //     },
            // },
        ],
    },
}, {
    externals: [
        webpackRxjsExternals(),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'datalux.node.js',
        libraryTarget: "commonjs",
        library: "datalux",
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
