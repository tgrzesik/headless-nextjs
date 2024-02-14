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
var cacheHandler_exports = {};
__export(cacheHandler_exports, {
  default: () => CacheHandler
});
module.exports = __toCommonJS(cacheHandler_exports);
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));

// src/cache-handler/rollout.ts
var import_crypto = __toESM(require("crypto"));
function isKVStoreActive(key, rolloutPercent) {
  const hash = import_crypto.default.createHash("sha256");
  hash.update(key);
  const buf = hash.digest();
  const hashInt = buf.readUIntBE(0, 4);
  return rolloutPercent > hashInt % 100 + 1;
}

// src/cache-handler/kv.ts
var import_node_fetch = __toESM(require("node-fetch"));
var import_https = __toESM(require("https"));
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
      throw new Error("KV: could not connect to remote kv store");
    }
    this.selfSignedAgent = new import_https.default.Agent({
      rejectUnauthorized: false
    });
    this.kvStoreToken = (_b = process.env.ATLAS_KV_STORE_TOKEN) != null ? _b : "";
    if (this.kvStoreToken === "") {
      throw new Error("KV: could not connect to remote kv store");
    }
  }
  get(key) {
    return __async(this, null, function* () {
      const response = yield (0, import_node_fetch.default)(`${this.kvStoreURL}/${key}`, {
        agent: this.selfSignedAgent,
        headers: {
          Authorization: `Bearer ${this.kvStoreToken}`
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
      const response = yield (0, import_node_fetch.default)(`${this.kvStoreURL}/${key}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.kvStoreToken}`
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
    this.filesystemCache = new import_file_system_cache.default(ctx);
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
    if (this.kvStore === void 0) {
      return false;
    }
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
//# sourceMappingURL=cacheHandler.js.map