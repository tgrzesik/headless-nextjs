// src/api/edgeCache.ts
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
    const response = await fetch(
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
import fetch2 from "node-fetch";
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
    const response = await fetch2(`${this.url}/${key}`, {
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
    const response = await fetch2(`${this.url}/${key}`, {
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