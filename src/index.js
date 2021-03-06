const path = require('path');
const { validate } = require('schema-utils');

const optionsSchema = require('./options.schema.json');

const PLUGIN_NAME = 'CopyAssetInMemoryPlugin';
const TEMPLATE_REGEX = /\[\\*([\w:]+)\\*\]/i;

class CopyAssetInMemoryPlugin {
  constructor(options) {
    validate(optionsSchema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'options',
    });

    this.options = options;

    this.moduleOption = {
      test: options.test,
      include: options.include,
      exclude: options.exclude,
    };
  }

  apply(compiler) {
    const {
      stage, transform, to, deleteOriginalAssets,
    } = this.options;

    const { webpack } = compiler;
    const { Compilation, ModuleFilenameHelpers } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const logger = compilation.getLogger(PLUGIN_NAME);

      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: stage || Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {
          const assetNames = Object.keys(assets).filter((assetName) => {
            return ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(assetName);
          });

          const assetPromises = assetNames.map(async (assetName) => {
            const asset = compilation.getAsset(assetName);

            logger.log(`processing: ${assetName}`);

            const result = {};

            if (transform) {
              logger.log(`transforming content for '${assetName}'...`);

              const buffer = asset.source.source();
              const transformed = await transform(buffer);
              result.source = new RawSource(transformed);
            } else {
              result.source = asset.source;
            }

            if (typeof to === 'string') {
              result.name = path.join(to, assetName);
              logger.log(`result asset destination '${result.name}'...`);
            }

            if (typeof to === 'function') {
              logger.log(`transforming path for '${assetName}'...`);
              result.name = await to(assetName);
            }

            result.info = {
              ...asset.info,
              copied: true,
            };

            if (TEMPLATE_REGEX.test(result.name)) {
              const { outputOptions } = compilation;
              const {
                hashDigest,
                hashDigestLength,
                hashFunction,
                hashSalt,
              } = outputOptions;
              const hash = compiler.webpack.util.createHash(hashFunction);

              if (hashSalt) {
                hash.update(hashSalt);
              }

              hash.update(result.source.source());

              const fullContentHash = hash.digest(hashDigest);
              const contentHash = fullContentHash.slice(0, hashDigestLength);
              const ext = path.extname(assetName);
              const base = path.basename(assetName);
              const name = base.slice(0, base.length - ext.length);

              const pathData = {
                filename: assetName,
                contentHash,
                chunk: {
                  name,
                  hash: contentHash,
                  contentHash,
                },
              };

              const {
                path: interpolatedFilename,
                info: assetInfo,
              } = compilation.getPathWithInfo(
                result.name,
                pathData,
              );

              result.name = interpolatedFilename;
              result.info = {
                ...assetInfo,
                ...result.info,
              };
            }

            const existingAsset = compilation.getAsset(result.name);

            if (existingAsset) {
              logger.log(`asset ${assetName} already exists in compilation. skipping...`);
              return;
            }

            if (deleteOriginalAssets) {
              logger.log(`deleting original original asset ${assetName}`);

              compilation.deleteAsset(assetName);
            }

            logger.log(`asset ${result.name} added to compilation`);
            compilation.emitAsset(result.name, result.source, result.info);
          });

          await Promise.all(assetPromises);
        },
      );
    });
  }
}

module.exports = CopyAssetInMemoryPlugin;
