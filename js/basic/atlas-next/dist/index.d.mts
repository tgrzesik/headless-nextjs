import IncrementalCache from 'next/dist/server/lib/incremental-cache/file-system-cache';
import { CacheHandler as CacheHandler$1 } from 'next/dist/server/lib/incremental-cache';

type FileSystemCacheContext = ConstructorParameters<typeof IncrementalCache>[0];
declare class CacheHandler {
    private readonly debug;
    private readonly filesystemCache;
    private readonly keyPrefix;
    private readonly kvStore?;
    private readonly kvStoreRolloutPercent;
    private readonly isBuild;
    private readonly buildID;
    constructor(ctx: FileSystemCacheContext);
    get(...args: Parameters<CacheHandler$1['get']>): Promise<any>;
    set(...args: Parameters<CacheHandler$1['set']>): Promise<void>;
    revalidateTag(...args: Parameters<CacheHandler$1['revalidateTag']>): Promise<void>;
    private generateKey;
    private getErrorMessage;
    private debugLog;
    /**
     * Should the KV Store be used for this key?
     */
    private useKVStore;
}

export { CacheHandler as default };
