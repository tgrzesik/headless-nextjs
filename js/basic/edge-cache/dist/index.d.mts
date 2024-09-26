declare class RateLimitError extends Error {
}
/**
 * Purge the given paths from the edge cache
 * @param paths
 * @returns
 */
declare function purgePaths(paths: string[]): Promise<any>;
/**
 * Purge the given tags from edge cache
 * @param tags
 * @returns
 */
declare function purgeTags(tags: string[]): Promise<any>;

export { RateLimitError, purgePaths, purgeTags };
