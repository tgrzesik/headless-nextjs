import { purgePaths } from '@wpengine/edge-cache';


export default async function handler(req, res) {
    try {
        const paths = ['/sample-odisr']
        await purgePaths(paths)
        return res.json({ purged: true })
    } catch (err) {
        console.log(err)
        return res.status(500).send('Error purging paths')
    }
}
