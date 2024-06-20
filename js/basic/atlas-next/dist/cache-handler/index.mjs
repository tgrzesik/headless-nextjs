// src/cache-handler/remoteCacheHandler.ts
import FileSystemCache from "next/dist/server/lib/incremental-cache/file-system-cache";

// src/cache-handler/rollout.ts
import crypto from "crypto";
function isRolledOut(id, rolloutPercent) {
  const hash = crypto.createHash("sha256");
  hash.update(id);
  const buf = hash.digest();
  const hashInt = buf.readUIntBE(0, 4);
  return rolloutPercent > hashInt % 100 + 1;
}

// src/api/kv.ts
import fetch from "node-fetch";

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
  version = "1.3.0-beta";
  constructor() {
    if (process.env.ATLAS_METADATA !== "true") {
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
    const urlExists = (process.env.ATLAS_KV_STORE_URL ?? "") !== "";
    const tokenExists = (process.env.ATLAS_KV_STORE_TOKEN ?? "") !== "";
    const atlasRuntime = String(process.env.ATLAS_METADATA).toLowerCase() === "true";
    return urlExists && tokenExists && atlasRuntime;
  }
  constructor() {
    super();
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
    const response = await fetch(`${this.url}/${key}`, {
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
    const response = await fetch(`${this.url}/${key}`, {
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
import fetch2 from "node-fetch";
var EdgeCache = class extends API {
  url;
  token;
  envuuid;
  static isAvailable() {
    const urlExists = (process.env.ATLAS_APPS_API_URL_ADDRESS ?? "") !== "";
    const tokenExists = (process.env.ATLAS_APPS_API_TOKEN ?? "") !== "";
    const atlasRuntime = String(process.env.ATLAS_METADATA).toLowerCase() === "true";
    return urlExists && tokenExists && atlasRuntime;
  }
  constructor() {
    super();
    this.url = process.env.ATLAS_APPS_API_URL_ADDRESS ?? "";
    if (this.url === "") {
      throw new Error(
        "EdgeCache: ATLAS_APPS_API_URL_ADDRESS env var is missing"
      );
    }
    this.token = process.env.ATLAS_APPS_API_TOKEN ?? "";
    if (this.token === "") {
      throw new Error("EdgeCache: ATLAS_APPS_API_TOKEN env var is missing");
    }
    this.envuuid = process.env.ATLAS_METADATA_ENV_ID ?? "";
    if (this.envuuid === "") {
      throw new Error("EdgeCache: ATLAS_METADATA_ENV_ID env var is missing");
    }
  }
  /**
   * Purge the edge cache by tags
   * @param string[]
   */
  async purgeByTags(tags) {
    const response = await fetch2(
      `${this.url}/envs/${this.envuuid}/edge/cache/tags:purge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
          "User-Agent": `AtlasNext/${this.version}`
        },
        body: JSON.stringify({ tags })
      }
    );
    this.throwResponseErrors(response, tags.join(","));
  }
  /**
   * Purge the edge cache by paths
   * @param string[]
   */
  async purgeByPaths(paths) {
    await this.purgeByTags(paths);
  }
};

// src/cache-handler/remoteCacheHandler.ts
import { promises as fs } from "fs";
import { normalizePagePath } from "next/dist/shared/lib/page-path/normalize-page-path";
var RemoteCacheHandler = class {
  debug;
  filesystemCache;
  keyPrefix = ".atlas";
  kvStore;
  edgeCache;
  kvStoreRolloutPercent;
  isBuild;
  buildID;
  nextBuildID;
  constructor(ctx) {
    this.filesystemCache = new FileSystemCache(ctx);
    this.debug = String(process.env.ATLAS_CACHE_HANDLER_DEBUG).toLowerCase() === "true";
    this.isBuild = String(process.env.ATLAS_METADATA_BUILD).toLowerCase() === "true";
    this.buildID = process.env.ATLAS_METADATA_BUILD_ID ?? "";
    if (this.isKVStoreAvailable()) {
      try {
        this.kvStore = new KV();
        this.debugLog("KV store enabled");
      } catch (error) {
        console.error(this.getErrorMessage(error));
      }
    }
    if (this.isEdgeCacheAvailable()) {
      try {
        this.edgeCache = new EdgeCache();
        this.debugLog("Edge Cache enabled");
      } catch (error) {
        console.error(this.getErrorMessage(error));
      }
    }
    const defaultPercent = 100;
    const percentEnv = process.env.ATLAS_CACHE_HANDLER_ROLLOUT_PERCENT ?? "";
    const percentEnvNum = parseInt(percentEnv, 10);
    this.kvStoreRolloutPercent = isNaN(percentEnvNum) ? defaultPercent : percentEnvNum;
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
    try {
      if (data.kind === "PAGE" && (ctx.revalidate === void 0 || ctx.revalidate === false)) {
        const dataPath = await this.pathToDataPath(key);
        this.debugLog(
          `ODISR for Page Router revalidated, purging paths: ${key} and ${dataPath}`
        );
        await this.edgeCache?.purgeByPaths([key, dataPath]);
      }
    } catch (error) {
      console.error(this.getErrorMessage(error));
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
    if (error instanceof Error) return error.message;
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
        "Warning: ATLAS_METADATA_BUILD_ID is missing, remote cache disabled"
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
   * Is the Edge Cache available for use?
   */
  isEdgeCacheAvailable() {
    if (this.isBuild) {
      return false;
    }
    if (!EdgeCache.isAvailable()) {
      return false;
    }
    return true;
  }
  async pathToDataPath(path) {
    if (this.nextBuildID === void 0) {
      const buildIDPath = ".next/BUILD_ID";
      try {
        await fs.access(buildIDPath);
        this.nextBuildID = (await fs.readFile(buildIDPath, "utf-8")).trim();
      } catch (error) {
        console.error("BUILD_ID file not found, cannot purge data path");
        throw error;
      }
    }
    const pagePath = normalizePagePath(path);
    const dataRoute = `/_next/data/${this.nextBuildID}${pagePath}.json`;
    return dataRoute;
  }
};

// src/cache-handler/index.ts
var cache_handler_default = RemoteCacheHandler;
export {
  cache_handler_default as default
};
//# sourceMappingURL=index.mjs.map