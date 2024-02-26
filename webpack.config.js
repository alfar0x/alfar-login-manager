"use strict";

const SizePlugin = require("size-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const PATHS = {
  src: path.resolve(__dirname, "./src"),
  build: path.resolve(__dirname, "./build"),
};

const common = {
  entry: { content: PATHS.src + "/content.js" },
  output: { path: PATHS.build, filename: "[name].js" },
  devtool: "source-map",
  stats: { all: false, errors: true, builtAt: true },
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: { outputPath: "images", name: "[name].[ext]" },
          },
        ],
      },
    ],
  },
  plugins: [
    new SizePlugin(),
    new CopyWebpackPlugin({ patterns: [{ from: "**/*", context: "public" }] }),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
  ],
};

module.exports = common;
