const getCompiler = require('./helpers/getCompiler');
const compile = require('./helpers/compile');

const CompressionPlugin = require('compression-webpack-plugin');
const CopyAssetInMemoryPlugin = require('../src/index.js');

const getAssetNames = (stats) => {
  const { assets } = stats.compilation;
  return Object.keys(assets);
};

const getAssetSize = (stats, assetName) => {
  const { assets } = stats.compilation;
  return assets[assetName].size();
};

const hasAsset = (stats, assetName) => {
  const assets = getAssetNames(stats)
  if (assetName instanceof RegExp) {
    return assets.some(name => assetName.test(name))
  }

  return assets.includes(assetName)
}

it('should do nothing when there is no change in filename', async () => {
  const compiler = getCompiler();

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to: (fileName) => fileName
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});

it('should do copy assets to the new location for a given filter', async () => {
  const compiler = getCompiler();

  const to = (fileName) => `js/${fileName}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to,
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(hasAsset(stats, 'js/main.js')).toBeTruthy();
  expect(assets.length).toBe(3);
});

it('should do copy assets to the new location when destination is a string', async () => {
  const compiler = getCompiler();

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to: 'js',
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(hasAsset(stats, 'js/main.js')).toBeTruthy();
  expect(assets.length).toBe(3);
});

it('should be able to transform file contents', async () => {
  const compiler = getCompiler();

  const newContent = 'new';
  const transform = (content) => `${content}${newContent}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to: (fileName) => `js/transformed-${fileName}`,
    transform,
  }).apply(compiler);

  const stats = await compile(compiler);

  const originalFileSize = getAssetSize(stats, 'main.js');
  const transformedFileSize = getAssetSize(stats, 'js/transformed-main.js');

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(originalFileSize + newContent.length).toEqual(transformedFileSize);
  expect(assets.length).toBe(3);
});

it('should do copy assets to the new location and interpolate-name', async () => {
  const compiler = getCompiler();

  const newContent = 'new';
  const to = (fileName) => `js/[path]-${fileName}`;
  const transform = (content) => `${content}${newContent}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to,
    transform,
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(hasAsset(stats, 'js/[path]-main.js')).toBeFalsy();
  expect(assets.length).toBe(3);
});

it('should deleteOriginalAsset', async () => {
  const compiler = getCompiler();

  const to = (fileName) => `js/deleteOriginalAsset-${fileName}`;

  new CopyAssetInMemoryPlugin({
    test: /.*/,
    to,
    deleteOriginalAssets: true,
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});

it('should add contenthash to the copied asset', async () => {
  const compiler = getCompiler();

  const to = () => `js/[name]-[contenthash:8].[ext]`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    to,
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(hasAsset(stats, /js\/file-[a-z-0-9]{0,8}.js$/)).toBeTruthy()
  expect(assets.length).toBe(3);
});

it('should work along with compression-webpack-plugin', async () => {
  const compiler = getCompiler();

  const to = (fileName) => `js/${fileName}`;

  new CopyAssetInMemoryPlugin({
    test: /.*.js(.map)?$/,
    to,
  }).apply(compiler);

  new CompressionPlugin({
    filename: '[file]',
    exclude: /js/,
    deleteOriginalAssets: 'keep-source-map',
    minRatio: 10,
  }).apply(compiler)

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(hasAsset(stats, 'js/main.js')).toBeTruthy()
  expect(assets.length).toBe(4);
});
