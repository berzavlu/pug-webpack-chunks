const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require("fs");
const webpack = require("webpack");
const ENV = require("./env");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const path = require("path");

const { PORT, ASSET_PATH } = ENV[process.env.NODE_ENV];

let entryObj = {
  vendor: ["./src/vendor.js"]
};

let templates = [];
let dir = "src/views";
let files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.match(/\.pug$/)) {
    let filename = file.substring(0, file.length - 4);
    templates.push(
      new HtmlWebPackPlugin({
        template: dir + "/" + filename + ".pug",
        filename: filename + ".html",
        global: require("./global.json"),
        pugName: filename,
        chunks: ["vendor", filename],
        favicon: "./assets/favicon.ico"
      })
    );
    entryObj[filename] = "./src/scripts/views/" + filename + ".js";
  }
});

module.exports = {
  entry: entryObj,
  output: {
    filename: "js/[name].[hash].chunk.js",
    path: path.resolve("./dist"),
    publicPath: ASSET_PATH
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /.pug$/,
        exclude: ["/node_modules/"],
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
              self: true
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    ...templates,
    new CopyWebpackPlugin([{ from: "assets", ignore: [".gitkeep"] }]),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].chunk.css",
      chunkFilename: "[name].css"
    }),
    new CleanWebpackPlugin(),
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development,
      // ./public directory is being served
      host: "localhost",
      port: PORT,
      proxy: "http://localhost:8080/",
      open: false
    })
  ]
};
