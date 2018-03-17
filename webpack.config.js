const path = require("path");

var commonConfig = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".js" ]
  }
};

var mainConfig = Object.assign({}, commonConfig, {
  entry: "./src/main.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  }
});
var popupMenuConfig = Object.assign({}, commonConfig, {
  entry: "./src/popupMenu.ts",
  output: {
    filename: "popupMenu.js",
    path: path.resolve(__dirname, "dist")
  }
});
var zombifiedConfig = Object.assign({}, commonConfig, {
  entry: "./src/zombified.ts",
  output: {
    filename: "zombified.js",
    path: path.resolve(__dirname, "dist")
  }
});

module.exports = [mainConfig, popupMenuConfig, zombifiedConfig];