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

// src/cache-handler/kv.ts
var import_node_fetch = __toESM(require("node-fetch"));
var KVError = class extends Error {
  response;
  constructor(response, key) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText} for key: ${key}`
    );
    this.response = response;
  }
};
var KVNotFoundError = class extends Error {
};
var KV = class {
  token;
  url;
  // The atlas-next package version will be injected from package.json
  // at build time by esbuild-plugin-version-injector
  version = "1.0.0";
  static isAvailable() {
    const urlExists = (process.env.ATLAS_KV_STORE_URL ?? "") !== "";
    const tokenExists = (process.env.ATLAS_KV_STORE_TOKEN ?? "") !== "";
    const atlasRuntime = String(process.env.ATLAS_METADATA).toLowerCase() === "true";
    return urlExists && tokenExists && atlasRuntime;
  }
  constructor() {
    if (process.env.ATLAS_METADATA !== "true") {
      throw new Error("KV: The app is not running on the Atlas Platform");
    }
    this.url = process.env.ATLAS_KV_STORE_URL ?? "";
    if (this.url === "") {
      throw new Error("KV: ATLAS_KV_STORE_URL env var is missing");
    }
    this.token = process.env.ATLAS_KV_STORE_TOKEN ?? "";
    if (this.token === "") {
      throw new Error("KV: ATLAS_KV_STORE_TOKEN env var is missing");
    }
  }
  async get(key) {
    const response = await (0, import_node_fetch.default)(`${this.url}/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "User-Agent": `AtlasNext/${this.version}`
      }
    });
    this.throwResponseErrors(response, key);
    return await response.json();
  }
  async set(key, data) {
    if (data === null) {
      return;
    }
    const response = await (0, import_node_fetch.default)(`${this.url}/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        "User-Agent": `AtlasNext/${this.version}`
      }
    });
    this.throwResponseErrors(response, key);
  }
  /**
   * Convert response status codes to KV errors and throw them
   * @param response
   * @param key
   */
  throwResponseErrors(response, key) {
    if (response.status === 404) {
      throw new KVNotFoundError();
    }
    if (response.status < 200 || response.status >= 300) {
      throw new KVError(response, key);
    }
  }
};

// src/config.ts
function withAtlasConfig(nextConfig, atlasConfig) {
  if (atlasConfig?.remoteCacheHandler === false) {
    return nextConfig;
  }
  const nextModulePath = import_path.default.parse(require.resolve("next"));
  const nextPackage = require(import_path.default.join(nextModulePath.dir, "../../package.json"));
  return setCacheHandler(
    nextConfig,
    nextPackage.version,
    // TODO: look closer how this can be stubbed to enable testing
    // of the withAtlasConfig function
    require.resolve("@wpengine/atlas-next/cache-handler")
  );
}
function setCacheHandler(nextConfig, nextVersion, cacheHandlerPath) {
  if (compare(nextVersion, "12.2.0") === -1) {
    throw new Error(
      "Next.js version " + nextVersion + " is not supported by @wpengine/atlas-next"
    );
  }
  if (compare(nextVersion, "13.4.12") === 1 && compare(nextVersion, "13.5.1") === -1) {
    throw new Error(
      "Next.js version " + nextVersion + " is not supported by @wpengine/atlas-next, please use version >= 13.5.1."
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
  } else {
    if (nextConfig.cacheHandler !== void 0) {
      console.warn("Overwriting existing cacheHandler config");
    }
    nextConfig.cacheHandler = cacheHandlerPath;
    if (nextConfig.cacheMaxMemorySize !== void 0) {
      console.warn("Overwriting existing cacheMaxMemorySize config");
    }
    nextConfig.cacheMaxMemorySize = 0;
  }
  printEnabledNotice();
  return nextConfig;
}
function printEnabledNotice() {
  if (process.env.ATLAS_CACHE_HANDLER_MESSAGE === void 0) {
    let message = "Atlas remote cache handler enabled";
    if (process.env.ATLAS_METADATA_BUILD === void 0 && !KV.isAvailable()) {
      message = message + " (local storage mode)";
    }
    console.log(message);
    process.env.ATLAS_CACHE_HANDLER_MESSAGE = "true";
  }
}
function compare(v1, v2) {
  const version1 = v1.split("-")[0];
  const version2 = v2.split("-")[0];
  validateVersion(version1);
  validateVersion(version2);
  const v1Parts = version1.split(".");
  const v1Major = v1Parts[0];
  const v1Minor = v1Parts[1];
  const v1Patch = v1Parts[2];
  const v2Parts = version2.split(".");
  const v2Major = v2Parts[0];
  const v2Minor = v2Parts[1];
  const v2Patch = v2Parts[2];
  const v1PatchLesserOrEqual = v1Patch < v2Patch ? -1 : 0;
  const comparePatchVersions = v1Patch > v2Patch ? 1 : v1PatchLesserOrEqual;
  const v1MinorLesserOrEqual = v1Minor < v2Minor ? -1 : comparePatchVersions;
  const compareMinorVersions = v1Minor > v2Minor ? 1 : v1MinorLesserOrEqual;
  const v1MajorLesserOrEqual = v1Major < v2Major ? -1 : compareMinorVersions;
  return v1Major > v2Major ? 1 : v1MajorLesserOrEqual;
}
function validateVersion(version) {
  const invalidVersionError = "Unable to validate Next.js version: " + version;
  if (version.length === 0) {
    throw new Error(invalidVersionError);
  }
  const parts = version.split(".");
  if (parts.length < 3) {
    throw new Error(invalidVersionError);
  }
  const major = parts[0];
  if (major.length === 0 || isNaN(Number(major))) {
    throw new Error(invalidVersionError);
  }
  const minor = parts[1];
  if (minor.length === 0 || isNaN(Number(minor))) {
    throw new Error(invalidVersionError);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  withAtlasConfig
});
//# sourceMappingURL=index.js.map