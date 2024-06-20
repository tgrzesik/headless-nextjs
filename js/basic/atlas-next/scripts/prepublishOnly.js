/**
 * Script that gets run before `npm publish`
 */

if (process.env.BUILD_ID === undefined) {
  console.error(
    '"npm publish" must be run by Google Cloud Build. See docs/releasing.md'
  )
  process.exit(1)
}

// TAG_NAME is the name of the git tag when run in Google Cloud Build
const gitTag = process.env.TAG_NAME
if (gitTag === undefined) {
  console.error(
    'Could not determine git tag. $TAG_NAME is undefined. See docs/releasing.md'
  )
  process.exit(1)
}

// The value of the version field in package.json
const pjsonVersion = process.env.npm_package_version ?? ''

// By convention the version in package.json doesn't have a prefix, but the git tag does
const tagVersionPrefix = 'v'
const prefixedPjsonVersion = tagVersionPrefix + pjsonVersion

if (prefixedPjsonVersion !== gitTag) {
  console.error(
    `Version field in package.json, ${prefixedPjsonVersion}, does not match the current git tag, ${gitTag}. See docs/releasing.md`
  )
  process.exit(1)
}
