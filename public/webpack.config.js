var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
    entry: path.resolve(__dirname, './src/js/index.js'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
        publicPath:"/public/",
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'src'),
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].css")
    ]
}