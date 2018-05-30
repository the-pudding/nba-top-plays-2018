const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: {
		bundle: './src/js/entry.js',
		critical: './src/js/critical.js'
	},
	output: {
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [require.resolve('babel-preset-env')],
						plugins: [
							require.resolve('babel-plugin-transform-object-rest-spread')
						]
					}
				}
			}
		]
	},
	plugins: [new UglifyJsPlugin()]
};
