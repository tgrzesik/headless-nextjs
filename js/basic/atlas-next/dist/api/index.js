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

// src/api/index.ts
var api_exports = {};
__export(api_exports, {
  EdgeCache: () => EdgeCache,
  KV: () => KV
});
module.exports = __toCommonJS(api_exports);

// src/api/edgeCache.ts
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

// src/api/edgeCache.ts
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
    const response = await (0, import_node_fetch.default)(
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

// src/api/kv.ts
var import_node_fetch2 = __toESM(require("node-fetch"));
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
    const response = await (0, import_node_fetch2.default)(`${this.url}/${key}`, {
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
    const response = await (0, import_node_fetch2.default)(`${this.url}/${key}`, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EdgeCache,
  KV
});
//# sourceMappingURL=index.js.map