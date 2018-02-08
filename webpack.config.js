/**
 * Created by lee on 2018/1/22.
 */
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = {
    entry:  __dirname + "/app/main-texture.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/public",//打包后的文件存放的地方
        filename: "bundle.js"//打包后输出文件的文件名
    },
    plugins: [
            // copy custom static assets
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname+ "/app/img"),
                    to: path.resolve(__dirname+ '/public/img')
                }
            ])
    ]
}