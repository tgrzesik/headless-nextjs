import { Response } from 'node-fetch';

declare class EdgeCache {
    /**
     * Purge the edge cache by tags
     * @param string[]
     */
    purgeByTags(tags: string[]): Promise<any>;
    /**
     * Purge the edge cache by paths
     * @param string[]
     */
    purgeByPaths(paths: string[]): Promise<any>;
}

declare abstract class API {
    protected readonly version: string;
    constructor();
    /**
     * Convert response status codes to API errors and throw them
     * @param response
     * @param key
     */
    protected throwResponseErrors(response: Response, key: string): void;
}

declare class KV extends API {
    private readonly token;
    private readonly url;
    static isAvailable(): boolean;
    constructor();
    get(key: string): Promise<any>;
    set(key: string, data: any): Promise<void>;
}

export { EdgeCache, KV };
