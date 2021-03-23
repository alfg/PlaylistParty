var entry = './app/web/src/app/main.js',
  output = {
    path: __dirname,
    filename: 'main.js'
  };

module.exports.development = {
    entry: entry,
    output: output,
    mode: 'development',
    module : {
        rules : [
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    }
};

module.exports.production = {
    entry: entry,
    output: output,
    mode: 'production',
    module : {
        rules : [
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    }
};
