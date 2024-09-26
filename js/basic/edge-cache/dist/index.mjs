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
export {
  RateLimitError,
  purgePaths,
  purgeTags
};
//# sourceMappingURL=index.mjs.map