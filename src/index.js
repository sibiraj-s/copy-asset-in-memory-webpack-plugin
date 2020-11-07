const { validate } = require('schema-utils');
const { Compilation, ModuleFilenameHelpers, sources } = require('webpack');
const { interpolateName } = require('loader-utils');

const optionsSchema = require('./options.schema.json')

const PLUGIN_NAME = 'CopyAssetInMemoryPlugin';

const isImmutable = (name) => {
  return (/\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi).test(name);
};

const isTemplate = (name) => {
  const template = /(\[ext\])|(\[name\])|(\[path\])|(\[folder\])|(\[emoji(?::(\d+))?\])|(\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\])|(\[\d+\])/;

  return template.test(name);
};

class CopyAssetInMemoryPlugin {
  constructor(options) {
    validate(optionsSchema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'options',
    })

    this.options = options;

    this.moduleOption = {
      test: options.test,
      include: options.include,
      exclude: options.exclude,
    };
  }

  apply(compiler) {
    const {
      stage, transform, transformPath, deleteOriginalAssets,
    } = this.options;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: stage || Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async (assets) => {
          const assetNames = Object.keys(assets).filter((assetName) => {
            return ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(assetName);
          });

          if (!transform && !transformPath) {
            return
          }

          const assetPromises = assetNames.map(async (assetName) => {
            const asset = compilation.getAsset(assetName);

            const result = {};

            if (transform) {
              const buffer = asset.source.source();
              const transformed = await transform(buffer);
              result.source = new sources.RawSource(transformed);
            } else {
              result.source = asset.source;
            }

            if (transformPath) {
              result.name = await transformPath(assetName);
            }

            result.info = {
              ...asset.info,
              copied: true,
              immutable: isImmutable(result.name),
            };

            if (isTemplate(result.name)) {
              result.name = interpolateName(
                {
                  resourcePath: assetName,
                },
                result.name,
                {
                  content: result.source.source(),
                },
              );
            }

            const existingAsset = compilation.getAsset(result.name)
            if (existingAsset) {
              return
            }

            if (deleteOriginalAssets) {
              compilation.deleteAsset(assetName);
            }

            compilation.emitAsset(result.name, result.source, result.info);
          });

          await Promise.all(assetPromises);
        },
      );
    });
  }
}

module.exports = CopyAssetInMemoryPlugin;
