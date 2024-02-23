"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  withAtlasConfig: () => withAtlasConfig
});
module.exports = __toCommonJS(src_exports);

// src/config.ts
var import_path = __toESM(require("path"));
function withAtlasConfig(nextConfig, atlasConfig) {
  if (atlasConfig?.remoteCacheHandler === false) {
    return nextConfig;
  }
  const nextModulePath = import_path.default.parse(require.resolve("next"));
  const nextPackage = require(import_path.default.join(nextModulePath.dir, "../../package.json"));
  try {
    return setCacheHandler(
      nextConfig,
      nextPackage.version,
      // TODO: look closer how this can be stubbed to enable testing
      // of the withAtlasConfig function
      require.resolve("@wpengine/atlas-next/cache-handler")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  withAtlasConfig
});
//# sourceMappingURL=index.js.map