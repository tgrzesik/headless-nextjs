import { existsSync, readFile, readJSON } from 'fs-extra'
import { join } from 'path'

export default async function handler(req, res) {
  try {
    await res.revalidate(req.query.page);

    // Fetch new versions of assets
    const distDir = '.next';
    const buildId = (await readFile(join(distDir, 'BUILD_ID'), 'utf8')).trim()

    // TODO this needs to be set based on the request path
    const routerType = 'page' // or app

    const htmlFilename = `${req.query.page}.html`;
    const htmlFileRoute = req.query.page;
    const htmlFile = join(process.cwd(), distDir, 'server', routerType, htmlFilename);
    const htmlAssetBody = await readFile(htmlFile, 'utf8');

    const jsonFileName = `${req.query.page}.json`;
    const jsonFileRoute = join('/_next', 'data', buildId, jsonFileName);
    const jsonFile = join(process.cwd(), distDir, 'server', routerType, jsonFileName);
    let jsonAssetBody = "";
    if (existsSync(jsonFile)) {
      jsonAssetBody = await readFile(jsonFile, 'utf8');
    }

    const rscFileName = `${req.query.page}.rsc`;
    const rscFileRoute = rscFileName;
    const rscFile = join(process.cwd(), distDir, 'server', routerType, rscFileName);
    let rscAssetBody = "";
    if (existsSync(rscFile)) {
      rscAssetBody = await readFile(rscFile, 'utf8');
    }

    return res.json({
      revalidated: true,
      assets: [
        {
          route: htmlFileRoute,
          content: htmlAssetBody,
        }, {
          route: jsonFileRoute,
          content: jsonAssetBody,
        }, {
          route: rscFileRoute,
          content: rscAssetBody,
        },
      ],
    });
  } catch (err) {
    return res.status(500).send(`Error revalidating: ${err}`);
  }
}
