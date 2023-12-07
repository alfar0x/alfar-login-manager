"use strict";

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const PATHS = require("./paths");

const config = merge(common, { entry: { content: PATHS.src + "/content.js" } });

module.exports = config;
