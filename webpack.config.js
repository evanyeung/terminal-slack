// Packages
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./main.js",
  target: "node",
  externals: [nodeExternals()],
  node: {
    __dirname: false
  },
  output: {
    filename: "dist/main.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["shebang-loader", "babel-loader"]
      }
    ]
  },
  plugins: []
};
