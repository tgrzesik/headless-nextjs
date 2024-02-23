var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/config.ts
import path from "path";
function withAtlasConfig(nextConfig, atlasConfig) {
  if (atlasConfig?.remoteCacheHandler === false) {
    return nextConfig;
  }
  const nextModulePath = path.parse(__require.resolve("next"));
  const nextPackage = __require(path.join(nextModulePath.dir, "../../package.json"));
  try {
    return setCacheHandler(
      nextConfig,
      nextPackage.version,
      // TODO: look closer how this can be stubbed to enable testing
      // of the withAtlasConfig function
      __require.resolve("@wpengine/atlas-next/cache-handler")
    );
  } catch (error) {
    console.warn("Setting cache handler config", error);
    return nextConfig;
  }
}
function setCacheHandler(nextConfig, nextVersion, cacheHandlerPath) {
  if (compare(nextVersion, "12.2.0") === -1 || compare(nextVersion, "13.4") === 0) {
    throw new Error(
      "The Atlas remote cache handler does not support Next.js version " + nextVersion
    );
  }
  if (compare(nextVersion, "14.1.0") === -1) {
    nextConfig.experimental = nextConfig.experimental ?? {};
    if (nextConfig.experimental.incrementalCacheHandlerPath !== void 0) {
      console.warn("Overwriting existing incrementalCacheHandlerPath config");
    }
    nextConfig.experimental.incrementalCacheHandlerPath = cacheHandlerPath;
    if (nextConfig.experimental.isrMemoryCacheSize !== void 0) {
      console.warn("Overwriting existing isrMemoryCacheSize config");
    }
    nextConfig.experimental.isrMemoryCacheSize = 0;
    return nextConfig;
  }
  if (nextConfig.cacheHandler !== void 0) {
    console.warn("Overwriting existing cacheHandler config");
  }
  nextConfig.cacheHandler = cacheHandlerPath;
  if (nextConfig.cacheMaxMemorySize !== void 0) {
    console.warn("Overwriting existing cacheMaxMemorySize config");
  }
  nextConfig.cacheMaxMemorySize = 0;
  return nextConfig;
}
function compare(v1, v2) {
  validateVersion(v1);
  validateVersion(v2);
  const v1Parts = v1.split(".");
  const v1Major = v1Parts[0];
  const v1Minor = v1Parts[1];
  const v2Parts = v2.split(".");
  const v2Major = v2Parts[0];
  const v2Minor = v2Parts[1];
  const v1MinorLesserOrEqual = v1Minor < v2Minor ? -1 : 0;
  const compareMinorVersions = v1Minor > v2Minor ? 1 : v1MinorLesserOrEqual;
  const v1MajorLesserOrEqual = v1Major < v2Major ? -1 : compareMinorVersions;
  return v1Major > v2Major ? 1 : v1MajorLesserOrEqual;
}
function validateVersion(version) {
  if (version.length === 0) {
    throw new Error("invalid version");
  }
  const parts = version.split(".");
  if (parts.length < 2) {
    throw new Error("invalid version");
  }
  const major = parts[0];
  if (major.length === 0 || isNaN(Number(major))) {
    throw new Error("invalid version");
  }
  const minor = parts[1];
  if (minor.length === 0 || isNaN(Number(minor))) {
    throw new Error("invalid version");
  }
}
export {
  withAtlasConfig
};
//# sourceMappingURL=index.mjs.map