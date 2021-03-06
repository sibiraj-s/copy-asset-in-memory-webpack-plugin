const path = require('path');

const webpack = require('webpack');

const getCompiler = (entry, outputOptions = {}) => {
  const compiler = webpack({
    entry: entry || './index.js',
    mode: 'production',
    devtool: 'source-map',
    context: path.resolve(__dirname, '../fixtures'),
    output: {
      clean: true,
      ...outputOptions,
    },
  });

  return compiler;
};

module.exports = getCompiler;
