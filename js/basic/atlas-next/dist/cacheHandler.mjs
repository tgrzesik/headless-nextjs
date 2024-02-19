var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/cache-handler/cacheHandler.ts
import FileSystemCache from "next/dist/server/lib/incremental-cache/file-system-cache";

// src/cache-handler/rollout.ts
import crypto from "crypto";
function isKVStoreActive(key, rolloutPercent) {
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
  constructor(response, key) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText} for key: ${key}`
    );
    this.response = response;
  }
};
var KVNotFoundError = class extends Error {
};
var version = "1.0.0-alpha.0";
var _throwResponseErrors, throwResponseErrors_fn;
var KV = class {
  constructor() {
    /**
     * Convert response status codes to KV errors and throw them
     * @param response
     * @param key
     */
    __privateAdd(this, _throwResponseErrors);
    var _a, _b;
    this.kvStoreURL = (_a = process.env.ATLAS_KV_STORE_URL) != null ? _a : "";
    if (this.kvStoreURL === "") {
      console.warn(
        "KV: could not connect to remote kv store - URL env var is missing"
      );
    }
    this.selfSignedAgent = new https.Agent({
      rejectUnauthorized: false
    });
    this.kvStoreToken = (_b = process.env.ATLAS_KV_STORE_TOKEN) != null ? _b : "";
    if (this.kvStoreToken === "") {
      console.warn(
        "KV: could not connect to remote kv store - token env var is missing"
      );
    }
  }
  get(key) {
    return __async(this, null, function* () {
      const response = yield fetch(`${this.kvStoreURL}/${key}`, {
        agent: this.selfSignedAgent,
        headers: {
          Authorization: `Bearer ${this.kvStoreToken}`,
          "User-Agent": "AtlasNext/" + version
        }
      });
      __privateMethod(this, _throwResponseErrors, throwResponseErrors_fn).call(this, response, key);
      return yield response.json();
    });
  }
  set(key, data) {
    return __async(this, null, function* () {
      if (data === null) {
        return;
      }
      const response = yield fetch(`${this.kvStoreURL}/${key}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.kvStoreToken}`,
          "User-Agent": "AtlasNext/" + version
        },
        agent: this.selfSignedAgent
      });
      __privateMethod(this, _throwResponseErrors, throwResponseErrors_fn).call(this, response, key);
    });
  }
};
_throwResponseErrors = new WeakSet();
throwResponseErrors_fn = function(response, key) {
  if (response.status === 404) {
    throw new KVNotFoundError();
  }
  if (response.status < 200 || response.status >= 300) {
    throw new KVError(response, key);
  }
};

// src/cache-handler/cacheHandler.ts
var CacheHandler = class {
  constructor(ctx) {
    this.keyPrefix = ".atlas";
    var _a;
    this.filesystemCache = new FileSystemCache(ctx);
    this.debug = String(process.env.ATLAS_CACHE_HANDLER_DEBUG).toLowerCase() === "true";
    this.skipKVStore = String(process.env.ATLAS_METADATA_BUILD).toLowerCase() === "true";
    if (!this.skipKVStore) {
      this.kvStore = new KV();
    }
    const percentEnv = (_a = process.env.ATLAS_CACHE_HANDLER_ROLLOUT_PERCENT) != null ? _a : "";
    const percentEnvNum = parseInt(percentEnv, 10);
    this.kvStoreRolloutPercent = isNaN(percentEnvNum) ? 100 : percentEnvNum;
  }
  get(...args) {
    return __async(this, null, function* () {
      const [key, ctx = {}] = args;
      if (!this.kvStoreActive(key) || this.kvStore === void 0) {
        this.debugLog(`GET ${key} (skip remote store)`);
        return yield this.filesystemCache.get(key, ctx);
      }
      const remoteKey = this.generateKey(key, this.keyPrefix);
      this.debugLog(`GET ${key} ${remoteKey}`);
      try {
        const data = yield this.kvStore.get(remoteKey);
        return data;
      } catch (error) {
        const is404 = error instanceof KVNotFoundError;
        if (!is404) {
          console.error(this.getErrorMessage(error));
        }
        try {
          const fsData = yield this.filesystemCache.get(key, ctx);
          if (is404 && (fsData == null ? void 0 : fsData.value) != null) {
            this.debugLog(`priming remote cache with ${key}`);
            yield this.set(key, fsData.value, {});
          }
          return fsData;
        } catch (err) {
          console.error(this.getErrorMessage(err));
          return null;
        }
      }
    });
  }
  set(...args) {
    return __async(this, null, function* () {
      const [key, data] = args;
      if (!this.kvStoreActive(key) || this.kvStore === void 0) {
        this.debugLog(`SET ${key} (skip remote store)`);
        yield this.filesystemCache.set(...args);
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
      const remoteKey = this.generateKey(key, this.keyPrefix);
      this.debugLog(`SET ${key} ${remoteKey}`);
      try {
        yield this.kvStore.set(remoteKey, cacheEntry);
      } catch (error) {
        console.error(this.getErrorMessage(error));
      }
      yield this.filesystemCache.set(...args);
    });
  }
  revalidateTag(...args) {
    return __async(this, null, function* () {
      yield this.filesystemCache.revalidateTag(...args);
    });
  }
  generateKey(key, prefix) {
    var _a;
    key = key.replace(/^\/+/g, "");
    const buildID = (_a = process.env.ATLAS_METADATA_BUILD_ID) != null ? _a : "no-build-id";
    return `${prefix}/${buildID}/next/${key}`;
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
  kvStoreActive(key) {
    if (this.skipKVStore) {
      return false;
    }
    if (this.kvStoreRolloutPercent >= 100) {
      return true;
    }
    if (this.kvStoreRolloutPercent <= 0) {
      return false;
    }
    return isKVStoreActive(key, this.kvStoreRolloutPercent);
  }
};
export {
  CacheHandler as default
};
//# sourceMappingURL=cacheHandler.mjs.map