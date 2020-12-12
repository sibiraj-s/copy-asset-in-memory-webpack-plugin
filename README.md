# copy-asset-in-memory-webpack-plugin

[![Tests](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin/workflows/Tests/badge.svg)](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin/actions)
[![License](https://badgen.net/github/license/sibiraj-s/copy-asset-in-memory-webpack-plugin)](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin)
[![Version](https://badgen.net/npm/v/copy-asset-in-memory-webpack-plugin)](https://npmjs.com/copy-asset-in-memory-webpack-plugin)
[![Node Version](https://badgen.net/npm/node/copy-asset-in-memory-webpack-plugin)](https://npmjs.com/copy-asset-in-memory-webpack-plugin)
[![Webpack Version](https://badgen.net/badge/webpack/%3E=5/orange)](https://webpack.js.org/)

> Copy assets in webpack memory

<p align="center">
  <a href="https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin">
    <img width="200" height="200" src="./assets/webpack.png">
  </a>
</p>

## Getting Started

### Installation

```bash
npm i -D copy-asset-in-memory-webpack-plugin
# or
yarn add --dev copy-asset-in-memory-webpack-plugin
```

### Usage

```js
// webpack.config.js
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      to: "js",
    }),
  ],
};
```

### Options

#### test

Include all assets that pass test assertion

Type: `String|RegExp|Array<String|RegExp>`. Default: `undefined`

#### include

Include all assets matching any of these conditions

Type: `String|RegExp|Array<String|RegExp>`. Default: `undefined`

#### exclude

Exclude all assets matching any of these conditions

Type: `String|RegExp|Array<String|RegExp>`. Default: `undefiend`

#### stage

Refer https://webpack.js.org/api/compilation-hooks/#processassets for more info.

```js
// webpack.config.js
const { Compilation } = require("webpack");
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER, // Default
      to: (fileName) => `${js}/filename`,
    }),
  ],
};
```

#### to

Asset destination, allows to modify the file path.

Type: `Function | string`. Default: `undefined`

```js
// webpack.config.js
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      to: (fileName) => `${js}/filename`, // copies all files into `js` folder
    }),
    new CopyAssetInMemoryPlugin({
      test: /.svg$/,
      to: "assets", // copies all files into `assets` folder
    }),
  ],
};
```

#### transform

Allows to modify the file contents.

Type: `Function`. Default: `undefined`

```js
// webpack.config.js
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      to: (fileName) => `${js}/filename`,
      // The `content` argument is a [`Buffer`](https://nodejs.org/api/buffer.html) object
      // it could be converted to a `String` to be processed using `content.toString()`
      transform: (content) => "newContent",
    }),
  ],
};
```

#### deleteOriginalAssets

Whether to delete the original assets or not.

Type: `boolean`. Default: `false`

### Caveats

- assets cannot be copied outside output directory
- deleting an asset via `deleteOriginalAssets` will also delete its sourcemap
