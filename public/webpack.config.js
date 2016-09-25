let path = require('path')

module.exports = {
    entry: path.resolve(__dirname, './src/js/index.js'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
        publicPath:"/public/",
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'src'),
                loaders: ['style', 'css']
            },{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    }
}