"use strict";

const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const hostparts = process.env.HOSTNAME.match(/(\w+)-\w+-(\w+)/);
const publichost = `${hostparts[2]}.${hostparts[1]}.codesandbox.io`;

function addStylus({ config, isNode, isDev }) {
  config.module.rules.push({
    test: /\.styl$/,
    sideEffects: true,
    use: [
      (isDev && !isNode && "style-loader") ||
        (!isNode &&
          !isDev && {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false
            }
          }),
      {
        loader: "css-loader",
        options: {
          sourceMap: false,
          esModule: false,
          modules: {
            exportOnlyLocals: isNode,
            localIdentName: "[name]__[local]___[hash:base64:5]"
          }
        }
      },
      {
        loader: "stylus-loader",
        options: {
          sourceMap: false,
          stylusOptions: {
            hoistAtrules: true
          }
        }
      }
    ].filter(Boolean)
  });

  return config;
}

module.exports = {
  modifyWebpackConfig(opts) {
    const config = opts.webpackConfig;

    if (opts.env.target === "web" && opts.env.dev) {
      config.devServer.public = `${publichost}:443`;
      config.devServer.proxy = {
        context: () => true,
        target: "http://localhost:3000"
      };
      config.devServer.index = "";
    }

    return addStylus({
      config,
      isNode: opts.env.target === "node",
      isDev: opts.env.dev
    });
  },
  modifyWebpackOptions({
    env: {
      target, // the target 'node' or 'web'
      dev // is this a development build? true or false
    },
    webpackObject, // the imported webpack node module
    options: {
      razzleOptions, // the modified options passed to Razzle in the `options` key in `razzle.config.js` (options: { key: 'value'})
      webpackOptions // the modified options that was used to configure webpack/ webpack loaders and plugins
    },
    paths // the modified paths that will be used by Razzle.
  }) {
    webpackOptions.definePluginOptions["CODESANDBOX_HOST"] = JSON.stringify(
      publichost
    );

    webpackOptions.fileLoaderExclude.push(/\.styl$/);

    return webpackOptions;
  }
};
