let webpack = require('webpack')
let path = require('path')

module.exports = {
    entry: path.join(__dirname,'./app.js'),
    output: {
        path: path.join(__dirname,'../public'),
        filename: 'js/index.js'
    }
}