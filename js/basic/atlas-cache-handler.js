"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/atlas-cache-handler.ts
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));
var import_node_fetch = __toESM(require("node-fetch"));
var HTTPResponseError = class extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
};
var checkStatus = (response) => {
  if (response.status < 200 && response.status >= 300) {
    throw new HTTPResponseError(response);
  }
};
module.exports = class CacheHandler {
  constructor(options) {
    this.filesystemCache = new import_file_system_cache.default(...arguments);
    this.kvStoreURL = process.env.ATLAS_CACHE_URL ?? "http://localhost:8083/kv";
    console.log("OPTIONS: ", options);
  }
  async get(key) {
    console.time("get");
    key = key.replace(/^\/+/g, "");
    key = this.getKey("cache/" + key);
    console.log(`GET: ${key}`);
    const response = await (0, import_node_fetch.default)(`${this.kvStoreURL}/${key}`);
    try {
      checkStatus(response);
      const res = await response.json();
      console.timeEnd("get");
      return res;
    } catch (error) {
      if (response.status === 404) {
        console.log("fallback");
        const fallback = await this.filesystemCache.get(...arguments);
        console.timeEnd("get");
        return fallback;
      }
      console.log(error.message);
      console.timeEnd("get");
    }
  }
  async set(key, data, ctx) {
    console.time("set");
    const payload = {
      value: data,
      lastModified: Date.now()
    };
    key = key.replace(/^\/+/g, "");
    key = this.getKey("cache/" + key);
    console.log(`SET: ${key}`, payload);
    await this.filesystemCache.set(...arguments);
    console.timeLog("set");
    const response = await (0, import_node_fetch.default)(`${this.kvStoreURL}/${key}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    try {
      checkStatus(response);
    } catch (error) {
      console.error(error);
      console.timeEnd("set");
    }
    console.timeEnd("set");
  }
  async revalidateTag(tag) {
    console.log(`REVALIDATE TAG: ${tag}`);
    await this.filesystemCache.revalidateTag(...arguments);
  }
  getKey(key, prefix) {
    key = key.replace(/^\/+/g, "");
    const envID = process.env.ATLAS_METADATA_ENV_ID ?? "envid";
    const buildID = process.env.ATLAS_METADATA_BUILD_ID ?? "buildid";
    if (prefix != null) {
      key = `${prefix}/key`;
    }
    return `${envID}/${buildID}/${key}`;
  }
};
