import IncrementalCache from 'next/dist/server/lib/incremental-cache/file-system-cache';
import { CacheHandler } from 'next/dist/server/lib/incremental-cache';

type FileSystemCacheContext = ConstructorParameters<typeof IncrementalCache>[0];
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
    private readonly kvStoreRolloutPercent;
    private readonly isBuild;
    private readonly buildID;
    constructor(ctx: FileSystemCacheContext);
    get(...args: Parameters<CacheHandler['get']>): Promise<any>;
    set(...args: Parameters<CacheHandler['set']>): Promise<void>;
    revalidateTag(...args: Parameters<CacheHandler['revalidateTag']>): Promise<void>;
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
}

export { RemoteCacheHandler as default };
