const path = require("path");
const webpack = require("webpack");

module.exports = {
	output: {
        path: path.join(__dirname, "dist"),
        filename: 'jsd.js',
		libraryTarget: "umd",
		library: "JSD",
	},
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
};
