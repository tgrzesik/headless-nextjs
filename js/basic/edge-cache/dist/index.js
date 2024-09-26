"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  RateLimitError: () => RateLimitError,
  purgePaths: () => purgePaths,
  purgeTags: () => purgeTags
});
module.exports = __toCommonJS(src_exports);

// src/edgeCache.ts
var version = "1.2.0";
var RateLimitError = class extends Error {
};
async function purgePaths(paths) {
  const debug = String(process.env.ATLAS_EDGE_CACHE_DEBUG).toLowerCase() === "true" || String(process.env.HEADLESS_EDGE_CACHE_DEBUG).toLowerCase() === "true";
  try {
    await purge(paths);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
  if (debug) {
    console.debug(
      `EdgeCache: DEBUG: Purged cache for paths: ${paths.join(",")}`
    );
  }
}
async function purgeTags(tags) {
  const debug = String(process.env.ATLAS_EDGE_CACHE_DEBUG).toLowerCase() === "true" || String(process.env.HEADLESS_EDGE_CACHE_DEBUG).toLowerCase() === "true";
  try {
    await purge(tags);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
  if (debug) {
    console.debug(`EdgeCache: DEBUG: Purged cache for tags: ${tags.join(",")}`);
  }
}
async function purge(paths) {
  const url = process.env.HEADLESS_APPS_API_URL_ADDRESS ?? "";
  const token = process.env.HEADLESS_APPS_API_TOKEN ?? "";
  const runtime = String(process.env.HEADLESS_METADATA).toLowerCase() === "true";
  const envuuid = process.env.HEADLESS_METADATA_ENV_ID ?? "";
  const isOnPlatform = url.length > 0 && token.length > 0 && runtime;
  if (!isOnPlatform) {
    console.log("EdgeCache: Skipping cache purge in local environment");
    return;
  }
  if (envuuid.length === 0) {
    throw new Error("EdgeCache: HEADLESS_METADATA_ENV_ID env var is missing");
  }
  const response = await fetch(`${url}/envs/${envuuid}/edge/cache/tags:purge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": `AtlasNext/${version}`
    },
    body: JSON.stringify({ tags: paths })
  });
  if (response.status === 429) {
    throw new RateLimitError(
      "EdgeCache: Rate limit exceeded (429), please try again later"
    );
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `EdgeCache: HTTP Error Response: ${response.status} ${response.statusText} for: ${paths.join(",")}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RateLimitError,
  purgePaths,
  purgeTags
});
//# sourceMappingURL=index.js.map