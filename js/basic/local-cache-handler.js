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

// src/atlas-cache-handler.ts
var atlas_cache_handler_exports = {};
__export(atlas_cache_handler_exports, {
  default: () => CacheHandler
});
module.exports = __toCommonJS(atlas_cache_handler_exports);
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));
var import_node_fetch = __toESM(require("node-fetch"));
var import_https = __toESM(require("https"));
var HTTPResponseError = class extends Error {
  constructor(response, key) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText} for key: ${key}`
    );
    this.response = response;
  }
};
var HTTPNotFoundError = class extends HTTPResponseError {
};
var CacheHandler = class {
  constructor(options) {
    this.keyPrefix = ".atlas";
    this.filesystemCache = new import_file_system_cache.default(...arguments);
    this.kvStoreURL = process.env.ATLAS_CACHE_URL ?? "https://kv-store.kv-store.svc.cluster.local/kv";
    this.selfSignedAgent = new import_https.default.Agent({
      rejectUnauthorized: false
    });
    this.debugMode = String(process.env.ATLAS_CACHE_HANDLER_DEBUG_MODE).toLowerCase() === "true";
    this.skipRemoteCache = String(process.env.ATLAS_METADATA_BUILD).toLowerCase() === "true";
    this.kvStoreToken = process.env.ATLAS_KV_STORE_TOKEN ?? "";
    if (!this.skipRemoteCache && this.kvStoreToken === "") {
      console.warn("ATLAS_KV_STORE_TOKEN is empty");
    }
  }
  async get(key) {
    if (this.skipRemoteCache) {
      return await this.filesystemCache.get(...arguments);
    }
    const remoteKey = this.generateKey(key, this.keyPrefix);
    this.debugLog(`GET ${key}`);
    try {
      const response = await (0, import_node_fetch.default)(`${this.kvStoreURL}/${remoteKey}`, {
        agent: this.selfSignedAgent,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.kvStoreToken}`
        }
      });
      this.validateCacheStatus(response, key);
      const json = await response.json();
      return json;
    } catch (error) {
      if (error instanceof HTTPNotFoundError) {
        try {
          const fallback = await this.filesystemCache.get(...arguments);
          if (fallback?.value != null) {
            this.debugLog(`Priming remote cache with ${key}`);
            await this.set(key, fallback.value);
          }
          return fallback;
        } catch (err) {
          console.error(err);
          return;
        }
      }
      console.error(error);
    }
  }
  async set(key, data) {
    if (this.skipRemoteCache) {
      await this.filesystemCache.set(...arguments);
      return;
    }
    const payload = {
      value: data,
      lastModified: Date.now()
    };
    const remoteKey = this.generateKey(key, this.keyPrefix);
    this.debugLog(`SET ${key}`);
    try {
      const response = await (0, import_node_fetch.default)(`${this.kvStoreURL}/${remoteKey}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.kvStoreToken}`
        },
        agent: this.selfSignedAgent
      });
      this.validateCacheStatus(response, key);
    } catch (error) {
      console.error(error);
    }
    try {
      await this.filesystemCache.set(...arguments);
    } catch (error) {
      console.error(error);
    }
  }
  async revalidateTag(tag) {
    await this.filesystemCache.revalidateTag(...arguments);
  }
  validateCacheStatus(response, key) {
    if (response.status === 404) {
      throw new HTTPNotFoundError(response, key);
    }
    if (response.status < 200 || response.status >= 300) {
      throw new HTTPResponseError(response, key);
    }
  }
  generateKey(key, prefix) {
    key = key.replace(/^\/+/g, "");
    const buildID = process.env.ATLAS_METADATA_BUILD_ID ?? "no-build-id";
    return `${prefix}/${buildID}/next/${key}`;
  }
  debugLog(msg) {
    if (this.debugMode) {
      console.debug("DEBUG: Cache Handler: " + msg);
    }
  }
};
