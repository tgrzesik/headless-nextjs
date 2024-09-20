import parse from 'semver/functions/parse.js'
import { execSync } from 'node:child_process'

const getTag = (version) => {
  const { prerelease } = parse(version, {}, true)
  if (prerelease.length > 0) {
    return 'prerelease'
  }

  return 'latest'
}
// The value of the version field in package.json
const pjsonVersion = process.env.npm_package_version ?? ''

const tag = getTag(pjsonVersion)

const dryRun = process.env.DRY_RUN ? '--dry-run' : ''

const command = `npm publish --tag=${tag} ${dryRun}`

execSync(
  command,
  {stdio: 'inherit'}
);
