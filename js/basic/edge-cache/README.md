# Edge Cache
Package that allows for controlling the edge cache on WP Engine Headless WordPress

## Install
To install the package, run:
```sh
$ npm install --save @wpengine/edge-cache
```

## Usage

The following code purges paths from the edge cache:
```javascript
import { purgePaths } from '@wpengine/edge-cache';

try {
  const paths = ['/foo', '/bar']
  await purgePaths(paths)
} catch (error) {
  console.error(error)
}
```

## API

### purgePaths
```ts
purgePaths(paths: []string): Promise<void>
```

#### Options
`paths`: The paths that should be purged from the edge cache

### purgeTags
```ts
purgeTags(tags: []string): Promise<void>
```

#### Options
`tags`: The tags that should be used to purge content from the edge cache

### RateLimitError
Error thrown when rate limit exceeded

## Report an issue

To report security vulnerabilities please see [https://wpengine.com/security/](https://wpengine.com/security/).

Bugs can be reported using the [live chat in the User Portal](https://my.wpengine.com/support/)

## License

[MIT License](./LICENCE) © WP Engine
