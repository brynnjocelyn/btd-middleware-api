import CopyPlugin from "copy-webpack-plugin";
import path from "path";

const srcPath = path.resolve(__dirname, "src");
const distPath = path.resolve(__dirname, "dist");

module.exports = {
  // Other configurations...
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: distPath,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: srcPath,
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/public", to: "dist/public" },
        { from: "src/views", to: "dist/views" },
      ],
    }),
  ],
};
