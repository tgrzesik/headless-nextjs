import IncrementalCache from 'next/dist/server/lib/incremental-cache/file-system-cache';
import { CacheHandler } from 'next/dist/server/lib/incremental-cache';

type FileSystemCacheContext = ConstructorParameters<typeof IncrementalCache>[0];
type CacheHandlerParametersSet = Parameters<CacheHandler['set']>;
type CacheHandlerParametersGet = Parameters<CacheHandler['get']>;
type CacheHandlerParametersRevalidateTag = Parameters<CacheHandler['revalidateTag']>;
/**
 * Implements the Next.js custom cache handler interface to provide a remote cache
 * on the Atlas WP Engine platform. The cache handler will fall back to reading from
 * the local disk in cases where the remote cache is unavailable
 *
 * https://nextjs.org/docs/app/building-your-application/deploying#configuring-caching
 */
declare class RemoteCacheHandler {
    private readonly debug;
    private readonly filesystemCache;
    private readonly keyPrefix;
    private readonly kvStore?;
    private readonly edgeCache?;
    private readonly kvStoreRolloutPercent;
    private readonly isBuild;
    private readonly buildID;
    private readonly previewModeId;
    private nextBuildID;
    private prerenderManifestPath;
    private buildIDPath;
    static minISRCacheRevalidateSeconds: number;
    constructor(ctx: FileSystemCacheContext);
    get(...args: CacheHandlerParametersGet): Promise<any>;
    set(...args: CacheHandlerParametersSet): Promise<void>;
    revalidateTag(...args: CacheHandlerParametersRevalidateTag): Promise<void>;
    private generateKey;
    private getErrorMessage;
    private debugLog;
    /**
     * Is the KV Store available for use?
     */
    private isKVStoreAvailable;
    /**
     * Should the KV Store be used for this key?
     */
    private useKVStore;
    /**
     * Takes a cache key and returns the URL paths
     * @param key cache key
     * @returns array of URL paths
     */
    private cacheKeyToPaths;
    /**
     * Check if the cache set if being triggered on-demand
     * @param ctx CacheHandler.set context
     * @returns
     */
    private isOnDemand;
}

export { RemoteCacheHandler as default };
