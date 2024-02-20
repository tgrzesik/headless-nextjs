// src/cache-handler/cacheHandler.ts
import FileSystemCache from "next/dist/server/lib/incremental-cache/file-system-cache";

// src/cache-handler/rollout.ts
import crypto from "crypto";
function rolloutKVStoreForKey(key, rolloutPercent) {
  const hash = crypto.createHash("sha256");
  hash.update(key);
  const buf = hash.digest();
  const hashInt = buf.readUIntBE(0, 4);
  return rolloutPercent > hashInt % 100 + 1;
}

// src/cache-handler/kv.ts
import fetch from "node-fetch";
import https from "https";
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
  selfSignedAgent;
  // The atlas-next package version will be injected from package.json
  // at build time by esbuild-plugin-version-injector
  version = "1.0.0-alpha.0";
  constructor() {
    this.url = process.env.ATLAS_KV_STORE_URL_TEST ?? "";
    if (this.url === "") {
      throw new Error("KV: ATLAS_KV_STORE_URL_TEST env var is missing");
    }
    this.token = process.env.ATLAS_KV_STORE_TOKEN_TEST ?? "";
    if (this.token === "") {
      throw new Error("KV: ATLAS_KV_STORE_TOKEN_TEST env var is missing");
    }
    this.selfSignedAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }
  async get(key) {
    const response = await fetch(`${this.url}/${key}`, {
      agent: this.selfSignedAgent,
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
      },
      agent: this.selfSignedAgent
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

// src/cache-handler/cacheHandler.ts
var CacheHandler = class {
  debug;
  filesystemCache;
  keyPrefix = ".atlas";
  kvStore;
  kvStoreRolloutPercent;
  isBuild;
  buildID;
  constructor(ctx) {
    this.filesystemCache = new FileSystemCache(ctx);
    this.debug = true;
    this.isBuild = String(process.env.ATLAS_METADATA_BUILD).toLowerCase() === "true";
    this.buildID = process.env.ATLAS_METADATA_BUILD_ID ?? "no-build-id";
    this.kvStore = new KV();
    this.debugLog("KV store enabled");
    const defaultPercent = 100;
    const percentEnv = process.env.ATLAS_CACHE_HANDLER_ROLLOUT_PERCENT ?? "";
    const percentEnvNum = parseInt(percentEnv, 10);
    this.kvStoreRolloutPercent = isNaN(percentEnvNum) ? defaultPercent : percentEnvNum;
  }
  async get(...args) {
    const [key, ctx = {}] = args;
    if (!this.useKVStore(key)) {
      this.debugLog(`GET ${key} (skip remote store)`);
      return await this.filesystemCache.get(key, ctx);
    }
    const remoteKey = this.generateKey(key);
    this.debugLog(`GET ${key} ${remoteKey}`);
    try {
      const data = await this.kvStore?.get(remoteKey);
      return data;
    } catch (error) {
      const is404 = error instanceof KVNotFoundError;
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
    const [key, data] = args;
    if (!this.useKVStore(key)) {
      this.debugLog(`SET ${key} (skip remote store)`);
      await this.filesystemCache.set(...args);
      return;
    }
    if (data === null) {
      this.debugLog(`SET ${key} (skip remote store, data is null)`);
      return;
    }
    const cacheEntry = {
      lastModified: Date.now(),
      value: data
    };
    const remoteKey = this.generateKey(key);
    this.debugLog(`SET ${key} ${remoteKey}`);
    try {
      await this.kvStore?.set(remoteKey, cacheEntry);
    } catch (error) {
      console.error(this.getErrorMessage(error));
    }
    await this.filesystemCache.set(...args);
  }
  async revalidateTag(...args) {
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
      console.debug("DEBUG: Cache Handler: " + msg);
    }
  }
  /**
   * Should the KV Store be used for this key?
   */
  useKVStore(key) {
    if (this.kvStore == null) {
      return false;
    }
    if (this.isBuild) {
      return false;
    }
    if (this.kvStoreRolloutPercent >= 100) {
      return true;
    }
    if (this.kvStoreRolloutPercent <= 0) {
      return false;
    }
    return rolloutKVStoreForKey(key, this.kvStoreRolloutPercent);
  }
};

// src/cache-handler/index.ts
var cache_handler_default = CacheHandler;
export {
  cache_handler_default as default
};
//# sourceMappingURL=index.mjs.map