# Releasing

How to cut a new release of the package

## Tag the new release

1. Figure out what will be in this release. The easiest way to do this is to look at what commits were made since the last tagged release `https://github.com/wpengine/atlas-next/compare/1.0.0...main`
  Where `1.0.0` is the tag of the latest release from here: https://github.com/wpengine/atlas-next/tags
1. Create a PR to update the version field in `package.json`. The version field follows SemVer. Use the information from step #1 to decide what the new release version should be.
1. Once the PR is merged you can create a new release: [https://github.com/wpengine/atlas-next/releases/new](https://github.com/wpengine/atlas-next/releases/new) with the SemVer version as the name and using the "Generate release notes" button to populate the release notes.
1. Once the release notes are created it will kick off a cloud run job which will publish the package.

Releases with [prerelease tags](https://github.com/npm/node-semver?tab=readme-ov-file#prerelease-tags) in the version will be tagged as a prerelease release on npm, all other releases will be tagged as `latest`.

## Failed Builds/Releases

If a release fails in Cloud Build you can restart it using the Cloud Build UI, or, if you need to add additional change to the release (for example if you forgot to bump the package.json version) the easiest way is to delete the release and tag through the Github UI and start the tag process (above) again from scratch. DO NOT do this if the release has already been published to npm. If the release is already published you need to create a new bug fix release.
