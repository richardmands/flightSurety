const webpack = require("webpack")
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const StartServerPlugin = require("start-server-webpack-plugin")

require("dotenv").config({ path: "./.env" })

module.exports = {
  entry: ["webpack/hot/poll?1000", "./index"],
  watch: true,
  target: "node",
  externals: [
    nodeExternals({
      whitelist: ["webpack/hot/poll?1000"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new StartServerPlugin("server.js"),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env.BUILD_TARGET": JSON.stringify("server"),
      "process.env.GANACHE_URL": JSON.stringify(process.env.GANACHE_URL),
    }),
  ],
  output: {
    path: path.join(__dirname, "prod/server"),
    filename: "server.js",
  },
}
