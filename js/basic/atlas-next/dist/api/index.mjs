// src/api/edgeCache.ts
import { purgePaths, purgeTags } from "@wpengine/edge-cache";
var EdgeCache = class {
  /**
   * Purge the edge cache by tags
   * @param string[]
   */
  async purgeByTags(tags) {
    await purgeTags(tags);
  }
  /**
   * Purge the edge cache by paths
   * @param string[]
   */
  async purgeByPaths(paths) {
    await purgePaths(paths);
  }
};

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
export {
  EdgeCache,
  KV
};
//# sourceMappingURL=index.mjs.map