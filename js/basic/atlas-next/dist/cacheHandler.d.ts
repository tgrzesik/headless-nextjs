import IncrementalCache from 'next/dist/server/lib/incremental-cache/file-system-cache';
import { CacheHandler as CacheHandler$1 } from 'next/dist/server/lib/incremental-cache';

declare class KV {
    #private;
    readonly kvStoreURL: string;
    private readonly selfSignedAgent;
    private readonly kvStoreToken;
    constructor();
    get(key: string): Promise<any>;
    set(key: string, data: any): Promise<void>;
}

type FileSystemCacheContext = ConstructorParameters<typeof IncrementalCache>[0];
declare class CacheHandler {
    readonly keyPrefix = ".atlas";
    readonly kvStore: KV;
    filesystemCache: IncrementalCache;
    private readonly skipKVStore;
    private readonly kvStoreRolloutPercent;
    private readonly debug;
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
    private kvStoreActive;
}

export { CacheHandler as default };
