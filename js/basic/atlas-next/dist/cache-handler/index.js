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

// src/cache-handler/index.ts
var cache_handler_exports = {};
__export(cache_handler_exports, {
  default: () => cache_handler_default
});
module.exports = __toCommonJS(cache_handler_exports);

// src/cache-handler/remoteCacheHandler.ts
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));

// src/cache-handler/rollout.ts
var import_crypto = __toESM(require("crypto"));
function isRolledOut(id, rolloutPercent) {
  const hash = import_crypto.default.createHash("sha256");
  hash.update(id);
  const buf = hash.digest();
  const hashInt = buf.readUIntBE(0, 4);
  return rolloutPercent > hashInt % 100 + 1;
}

// src/api/kv.ts
var import_node_fetch = __toESM(require("node-fetch"));

// src/api/api.ts
var APIError = class extends Error {
  response;
  constructor(response, key) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText} for key(s): ${key}`
    );
    this.response = response;
  }
};
var APINotFoundError = class extends Error {
};
var API = class {
  // The atlas-next package version will be injected from package.json
  // at build time by esbuild-plugin-version-injector
  version = "1.4.1";
  constructor() {
    if (process.env.HEADLESS_METADATA !== "true") {
      throw new Error("API: The app is not running on the Atlas Platform");
    }
  }
  /**
   * Convert response status codes to API errors and throw them
   * @param response
   * @param key
   */
  throwResponseErrors(response, key) {
    if (response.status === 404) {
      throw new APINotFoundError();
    }
    if (response.status < 200 || response.status >= 300) {
      throw new APIError(response, key);
    }
  }
};

// src/api/kv.ts
var KV = class extends API {
  token;
  url;
  static isAvailable() {
    const urlExists = (process.env.HEADLESS_KV_STORE_URL ?? "") !== "";
    const tokenExists = (process.env.HEADLESS_KV_STORE_TOKEN ?? "") !== "";
    const atlasRuntime = String(process.env.HEADLESS_METADATA).toLowerCase() === "true";
    return urlExists && tokenExists && atlasRuntime;
  }
  constructor() {
    super();
    if (process.env.HEADLESS_METADATA !== "true") {
      throw new Error("KV: The app is not running on the Atlas Platform");
    }
    this.url = process.env.HEADLESS_KV_STORE_URL ?? "";
    if (this.url === "") {
      throw new Error("KV: HEADLESS_KV_STORE_URL env var is missing");
    }
    this.token = process.env.HEADLESS_KV_STORE_TOKEN ?? "";
    if (this.token === "") {
      throw new Error("KV: HEADLESS_KV_STORE_TOKEN env var is missing");
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
};

// src/api/edgeCache.ts
var import_edge_cache = require("@wpengine/edge-cache");
var EdgeCache = class {
  /**
   * Purge the edge cache by tags
   * @param string[]
   */
  async purgeByTags(tags) {
    await (0, import_edge_cache.purgeTags)(tags);
  }
  /**
   * Purge the edge cache by paths
   * @param string[]
   */
  async purgeByPaths(paths) {
    await (0, import_edge_cache.purgePaths)(paths);
  }
};

// src/cache-handler/remoteCacheHandler.ts
var import_fs = require("fs");
var import_denormalize_page_path = require("next/dist/shared/lib/page-path/denormalize-page-path");
var import_normalize_page_path = require("next/dist/shared/lib/page-path/normalize-page-path");
var RemoteCacheHandler = class _RemoteCacheHandler {
  debug;
  filesystemCache;
  keyPrefix = ".atlas";
  kvStore;
  edgeCache;
  kvStoreRolloutPercent;
  isBuild;
  buildID;
  previewModeId;
  nextBuildID;
  prerenderManifestPath = ".next/prerender-manifest.json";
  // eslint-disable-line @typescript-eslint/prefer-readonly
  buildIDPath = ".next/BUILD_ID";
  // eslint-disable-line @typescript-eslint/prefer-readonly
  static minISRCacheRevalidateSeconds = 10;
  constructor(ctx) {
    this.filesystemCache = new import_file_system_cache.default(ctx);
    this.debug = String(process.env.ATLAS_CACHE_HANDLER_DEBUG).toLowerCase() === "true" || String(process.env.HEADLESS_CACHE_HANDLER_DEBUG).toLowerCase() === "true";
    this.isBuild = String(process.env.HEADLESS_METADATA_BUILD).toLowerCase() === "true";
    this.buildID = process.env.HEADLESS_METADATA_BUILD_ID ?? "";
    if (this.isKVStoreAvailable()) {
      try {
        this.kvStore = new KV();
        this.debugLog("KV store enabled");
      } catch (error) {
        console.error(this.getErrorMessage(error));
      }
    }
    try {
      this.edgeCache = new EdgeCache();
      this.debugLog("Edge Cache enabled");
    } catch (error) {
      console.error(this.getErrorMessage(error));
    }
    const defaultPercent = 100;
    const percentEnv = process.env.HEADLESS_CACHE_HANDLER_ROLLOUT_PERCENT ?? "";
    const percentEnvNum = parseInt(percentEnv, 10);
    this.kvStoreRolloutPercent = isNaN(percentEnvNum) ? defaultPercent : percentEnvNum;
    const xPrerenderRevalidate = ctx?._requestHeaders?.["x-prerender-revalidate"];
    if (Array.isArray(xPrerenderRevalidate)) {
      this.previewModeId = xPrerenderRevalidate.pop();
    } else {
      this.previewModeId = xPrerenderRevalidate;
    }
  }
  async get(...args) {
    const [key, ctx = {}] = args;
    if (!this.useKVStore(key)) {
      this.debugLog(`GET <hint:${ctx.kindHint}> ${key} (skip remote cache)`);
      return await this.filesystemCache.get(key, ctx);
    }
    const remoteKey = this.generateKey(key);
    this.debugLog(`GET <hint:${ctx.kindHint}> ${key} ${remoteKey}`);
    try {
      const data = await this.kvStore?.get(remoteKey);
      return data;
    } catch (error) {
      const is404 = error instanceof APINotFoundError;
      if (!is404) {
        console.error(this.getErrorMessage(error));
      }
      try {
        const fsData = await this.filesystemCache.get(key, ctx);
        if (is404 && fsData?.value != null) {
          this.debugLog(`priming remote cache with ${key}`);
          await this.set(key, fsData.value, {});
        }
        return fsData;
      } catch (err) {
        console.error(this.getErrorMessage(err));
        return null;
      }
    }
  }
  async set(...args) {
    const [key, data, ctx] = args;
    if (!this.useKVStore(key)) {
      this.debugLog(`SET <kind:${data?.kind}> ${key} (skip remote cache)`);
      await this.filesystemCache.set(...args);
      return;
    }
    if (data === null) {
      this.debugLog(`SET <kind:> ${key} (skip remote cache, data is null)`);
      return;
    }
    const cacheEntry = {
      lastModified: Date.now(),
      value: data
    };
    const remoteKey = this.generateKey(key);
    this.debugLog(`SET <kind:${data.kind}> ${key} ${remoteKey}`);
    try {
      await this.kvStore?.set(remoteKey, cacheEntry);
    } catch (error) {
      console.error(this.getErrorMessage(error));
    }
    await this.filesystemCache.set(...args);
    try {
      if (data.kind === "PAGE" && await this.isOnDemand(ctx)) {
        const paths = await this.cacheKeyToPaths(key);
        this.debugLog(
          `ODISR for Page Router revalidated, purging paths: ${paths.join(" ")}`
        );
        await this.edgeCache?.purgeByPaths(paths);
      }
    } catch (error) {
      console.error(this.getErrorMessage(error));
    }
  }
  async revalidateTag(...args) {
    const [tag] = args;
    this.debugLog(`Revalidate Tag: ${tag.toString()}`);
    await this.filesystemCache.revalidateTag(...args);
  }
  generateKey(key) {
    key = key.replace(/^\/+/g, "");
    return `${this.keyPrefix}/${this.buildID}/next/${key}`;
  }
  getErrorMessage(error) {
    if (error instanceof Error)
      return error.message;
    return String(error);
  }
  debugLog(msg) {
    if (this.debug) {
      console.debug("DEBUG: Remote Cache Handler: " + msg);
    }
  }
  /**
   * Is the KV Store available for use?
   */
  isKVStoreAvailable() {
    if (this.isBuild) {
      return false;
    }
    if (!KV.isAvailable()) {
      return false;
    }
    if (this.buildID === "") {
      console.log(
        "Warning: HEADLESS_METADATA_BUILD_ID is missing, remote cache disabled"
      );
      return false;
    }
    return true;
  }
  /**
   * Should the KV Store be used for this key?
   */
  useKVStore(key) {
    if (this.kvStore === void 0) {
      return false;
    }
    if (this.kvStoreRolloutPercent >= 100) {
      return true;
    }
    if (this.kvStoreRolloutPercent <= 0) {
      return false;
    }
    return isRolledOut(key, this.kvStoreRolloutPercent);
  }
  /**
   * Takes a cache key and returns the URL paths
   * @param key cache key
   * @returns array of URL paths
   */
  async cacheKeyToPaths(key) {
    if (this.nextBuildID === void 0) {
      try {
        await import_fs.promises.access(this.buildIDPath);
        this.nextBuildID = (await import_fs.promises.readFile(this.buildIDPath, "utf-8")).trim();
      } catch (error) {
        console.error("BUILD_ID file not found, cannot purge data path");
        throw error;
      }
    }
    const pagePath = (0, import_denormalize_page_path.denormalizePagePath)(key);
    const dataPath = `/_next/data/${this.nextBuildID}${(0, import_normalize_page_path.normalizePagePath)(pagePath)}.json`;
    return [pagePath, dataPath];
  }
  /**
   * Check if the cache set if being triggered on-demand
   * @param ctx CacheHandler.set context
   * @returns
   */
  async isOnDemand(ctx) {
    if (ctx === void 0) {
      return false;
    }
    if (ctx.revalidate === void 0 || ctx.revalidate === false) {
      return true;
    }
    if (ctx.revalidate < _RemoteCacheHandler.minISRCacheRevalidateSeconds) {
      return false;
    }
    if (this.previewModeId !== void 0) {
      try {
        await import_fs.promises.access(this.prerenderManifestPath);
        const manifest = JSON.parse(
          await import_fs.promises.readFile(this.prerenderManifestPath, "utf8")
        );
        if (this.previewModeId === manifest.preview.previewModeId) {
          return true;
        }
      } catch (error) {
        console.error("Could not get preview mode ID", error);
      }
    }
    return false;
  }
};

// src/cache-handler/index.ts
var cache_handler_default = RemoteCacheHandler;
//# sourceMappingURL=index.js.map