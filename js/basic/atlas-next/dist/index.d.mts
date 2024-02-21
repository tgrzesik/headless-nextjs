import { NextConfig } from 'next';

interface AtlasConfig extends Record<string, any> {
    /**
     * If set to `false`, the Atlas remote cache handler will not be added (defaults to true)
     */
    remoteCacheHandler?: boolean;
}
/**
 * Add Atlas options to the config to be exported from the user's Next.js config file
 * @param nextConfig
 * @param atlasConfig
 * @returns The modified config
 */
declare function withAtlasConfig(nextConfig: NextConfig, atlasConfig?: AtlasConfig): NextConfig;

export { type AtlasConfig, withAtlasConfig };
