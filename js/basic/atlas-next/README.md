# Atlas Next
Package for improved Next.js support on WP Engine Atlas.

## Prerequisites
See [our Node.js documentation](https://developers.wpengine.com/docs/atlas/platform-guides/customizing-builds/#nodejs) for supported versions of Node.js on Atlas

The Atlas Next package requires a minimum Next.js version of v13.0.0

WARNING: Next.js versions between 13.4.13 and 13.5.1 are not supported due to an [issue in Next.js](https://github.com/vercel/next.js/issues/54453)

## Install
To install the package, run:
```sh
$ npm install @wpengine/atlas-next
```

## Usage
Wrap your existing `nextConfig` in the `next.config.js` file
```ts
const { withAtlasConfig } = require("@wpengine/atlas-next")

const nextConfig = {
  // Your existing next config
}

module.exports = withAtlasConfig(nextConfig)
```

## API

### withAtlasConfig
```ts
withAtlasConfig(nextConfig: NextConfig, atlasConfig?: AtlasConfig): NextConfig
```

#### Options
`nextConfig`

The existing `nextConfig` in the `next.config.js` file

`atlasConfig`

Options to configure Next.js running on WP Engine Atlas
| Name | Type | Default value |
| --- | --- | --- |
| remoteCacheHandler | boolean | true |


## Report an issue

To report security vulnerabilities please see [https://wpengine.com/security/](https://wpengine.com/security/).

Bugs can be reported to using the [live chat in the User Portal](https://my.wpengine.com/support/)

## License

[MIT License](./LICENCE) © WP Engine
