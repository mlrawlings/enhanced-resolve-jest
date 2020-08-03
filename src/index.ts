import fs from "fs";
import { ResolverFactory, CachedInputFileSystem } from "enhanced-resolve";

const EMPTY_FILE = require.resolve("./empty");

type CreateResolver = typeof ResolverFactory.createResolver;
type Resolver = ReturnType<CreateResolver>;
type ResolverOpts = Parameters<CreateResolver>[0];
type JestResolveOpts = Parameters<
  typeof import("jest-resolve/build/defaultResolver").default
>[1];
type getConfigOpts = Pick<
  JestResolveOpts,
  "browser" | "extensions" | "moduleDirectory"
>;

const cachedInputFileSystem = new CachedInputFileSystem(fs as any, 60000);
let queuedPurge = false;
export default module.exports = exports = create(getDefaultConfig);

export function create(getConfig: (opts: getConfigOpts) => ResolverOpts) {
  const resolverCache: { [x: string]: Resolver } = Object.create(null);
  return (modulePath: string, jestOpts: JestResolveOpts) => {
    if (!queuedPurge) {
      queuedPurge = true;
      setImmediate(() => {
        cachedInputFileSystem.purge();
        queuedPurge = false;
      });
    }

    const configOpts = {
      browser: jestOpts.browser,
      extensions: jestOpts.extensions,
      moduleDirectory: jestOpts.moduleDirectory
    };
    const userConfig = getConfig(configOpts);
    const cacheKey = `${configOpts.browser}\0${jestOpts.extensions}\0${configOpts.moduleDirectory}`;
    const resolver =
      resolverCache[cacheKey] ||
      (resolverCache[cacheKey] = ResolverFactory.createResolver({
        fileSystem: cachedInputFileSystem as any,
        ...userConfig,
        useSyncFileSystemCalls: true
      }));

    const resolved = resolver.resolveSync({}, jestOpts.basedir, modulePath) as
      | string
      | false;

    if (resolved === false) {
      return EMPTY_FILE;
    }

    return resolved;
  };
}

export function getDefaultConfig(opts: getConfigOpts): ResolverOpts {
  return {
    symlinks: true,
    extensions: opts.extensions,
    modules: opts.moduleDirectory,
    fileSystem: fs as ResolverOpts["fileSystem"],
    ...(opts.browser
      ? {
          aliasFields: ["browser"],
          mainFields: ["browser", "main"]
        }
      : {})
  };
}
