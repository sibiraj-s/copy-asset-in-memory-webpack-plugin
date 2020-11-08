# copy-asset-in-memory-webpack-plugin

[![Tests](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin/workflows/Tests/badge.svg)](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin/actions)
[![License](https://badgen.net/github/license/sibiraj-s/copy-asset-in-memory-webpack-plugin)](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin)
[![Version](https://badgen.net/npm/v/copy-asset-in-memory-webpack-plugin)](https://npmjs.com/copy-asset-in-memory-webpack-plugin)
[![Node Version](https://badgen.net/npm/node/copy-asset-in-memory-webpack-plugin)](https://npmjs.com/copy-asset-in-memory-webpack-plugin)

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
      transformPath: (fileName) => `${js}/filename`,
    }),
  ],
};
```

### Options

- **test** - [`String|RegExp|Array<String|RegExp>`] - Include all assets that pass test assertion
- **include** - [`String|RegExp|Array<String|RegExp>`] - Include all assets matching any of these conditions
- **exclude** - [`String|RegExp|Array<String|RegExp>`] - Exclude all assets matching any of these conditions
- **stage** - Refer https://webpack.js.org/api/compilation-hooks/#processassets for more info.

```js
// webpack.config.js
const { Compilation } = require("webpack");
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER, // Default
      transformPath: (fileName) => `${js}/filename`,
    }),
  ],
};
```

- **transform** [`Function`] - Allows to modify the file contents.

```js
// webpack.config.js
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      transformPath: (fileName) => `${js}/filename`,
      // The `content` argument is a [`Buffer`](https://nodejs.org/api/buffer.html) object
      // it could be converted to a `String` to be processed using `content.toString()`
      transform: (content) => "newContent",
    }),
  ],
};
```

- **transformPath** [`Function`] - Allows to modify the file path. This executes after transform function

```js
// webpack.config.js
const CopyAssetInMemoryPlugin = require("copy-asset-in-memory-webpack-plugin");

module.exports = {
  plugins: [
    new CopyAssetInMemoryPlugin({
      test: /.js$/,
      transformPath: (fileName) => `${js}/filename`,
    }),
  ],
};
```

- **deleteOriginalAssets** [`boolean`] - Whether to delete the original assets or not. Defaults to `false`

**Caveats**

- assets cannot be copied outside output directory
- deleting an asset via `deleteOriginalAssets` will also delete its sourcemap
