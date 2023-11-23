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

// src/request.ts
var import_url = require("url");
var import_http = require("http");
var import_https = require("https");
async function request(url, options) {
  if (!(url instanceof import_url.URL)) {
    url = new import_url.URL(url);
  }
  return await new Promise((resolve, reject) => {
    options = options ?? {};
    options.headers = options.headers ?? {};
    const requestFn = url.protocol === "http:" ? import_http.request : import_https.request;
    const req = requestFn(url, options);
    req.on("response", (res) => {
      let chunk = Buffer.from("");
      res.on("data", (data) => {
        chunk = Buffer.concat([chunk, data]);
      });
      res.on("end", () => {
        res.data = chunk;
        resolve(res);
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    if (options.data !== void 0) {
      req.setHeader("content-type", "application/json");
      req.write(JSON.stringify(options.data));
    }
    req.end();
  });
}

// src/atlas-cache-handler.ts
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));
module.exports = class CacheHandler extends import_file_system_cache.default {
  constructor(options) {
    super(options);
    this.kvStoreURL = process.env.ATLAS_CACHE_URL ?? "http://127.0.0.1:8083/kv";
    console.log("OPTIONS: ", options);
  }
  async get(key) {
    console.time("get");
    key = key.replace(/^\/+/g, "");
    key = this.getKey("cache/" + key);
    console.log(`GET: ${key}`);
    try {
      const response = await request(`${this.kvStoreURL}/${key}`, {
        method: "GET"
      });
      console.timeEnd("get");
      return response.data;
    } catch (error) {
      if (error.response.status !== 404) {
        console.error(error);
      }
      console.timeLog("get");
      const fallback = super.get(...arguments);
      console.timeEnd("get");
      return fallback;
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
    await super.set(...arguments);
    console.timeLog("set");
    try {
      await request(`${this.kvStoreURL}/${key}`, {
        method: "PUT",
        data: payload
      });
    } catch (error) {
      console.error(error);
    }
    console.timeEnd("set");
  }
  async revalidateTag(tag) {
    console.log(`REVALIDATE TAG: ${tag}`);
    await super.revalidateTag(...arguments);
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
