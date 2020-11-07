const getCompiler = require('./helpers/getCompiler');
const compile = require('./helpers/compile');

const CopyAssetInMemoryPlugin = require('../src/index.js');

const getAssetNames = (stats) => {
  const { assets } = stats.compilation;
  return Object.keys(assets);
};

const getAssetSize = (stats, assetName) => {
  const { assets } = stats.compilation;
  return assets[assetName].size();
};

it('should do nothing and initialize without any errors ', async () => {
  const compiler = getCompiler();

  new CopyAssetInMemoryPlugin({}).apply(compiler);
  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});

it('should do nothing and just update the existing files', async () => {
  const compiler = getCompiler();

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});

it('should do nothing when there is no change in filename', async () => {
  const compiler = getCompiler();

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    transformPath: (fileName) => fileName
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});

it('should do copy assets to the new location for a given filter', async () => {
  const compiler = getCompiler();

  const transformPath = (fileName) => `js/${fileName}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    transformPath,
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.includes('js/main.js')).toBeTruthy();
  expect(assets.length).toBe(3);
});

it('should be able to transform file contents', async () => {
  const compiler = getCompiler();

  const newContent = 'new';
  const transform = (content) => `${content}${newContent}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    transformPath: (fileName) => `js/transformed-${fileName}`,
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
  const transformPath = (fileName) => `js/[path]-${fileName}`;
  const transform = (content) => `${content}${newContent}`;

  new CopyAssetInMemoryPlugin({
    test: /.js$/,
    transformPath,
    transform,
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.includes('js/[path]-main.js')).toBeFalsy();
  expect(assets.length).toBe(3);
});

it('should deleteOriginalAsset', async () => {
  const compiler = getCompiler();

  const transformPath = (fileName) => `js/deleteOriginalAsset-${fileName}`;

  new CopyAssetInMemoryPlugin({
    test: /.*/,
    transformPath,
    deleteOriginalAssets: true,
  }).apply(compiler);

  const stats = await compile(compiler);
  const assets = getAssetNames(stats);

  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(2);
});
