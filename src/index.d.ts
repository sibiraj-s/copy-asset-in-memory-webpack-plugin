import { Compiler, WebpackPluginInstance } from 'webpack';

type Rule = string | RegExp | Array<string | RegExp>;

interface Options {
  test: Rule;
  include?: Rule;
  exclude?: Rule;
  stage?: number;
  transform?: (buffer: Buffer) => string;
  to: string | ((fileName: string) => string);
  deleteOriginalAssets?: boolean;
}

declare class CopyAssetInMemoryPlugin implements WebpackPluginInstance {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = CopyAssetInMemoryPlugin;
