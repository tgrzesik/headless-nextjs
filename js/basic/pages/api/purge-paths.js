import { purgePaths } from '@wpengine/edge-cache';

try {
    const paths = ['/sample-odisr']
    await purgePaths(paths)
} catch (error) {
    console.error(error)
}
