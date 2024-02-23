# Cache Handler Local Testing And Development

## Description
This Document explains the steps necessary to develop and locally use the atlas-next npm package.

## Clone the Atlas-next repository and build the package
- Clone the atlas-next repository from [GitHub]{https://github.com/wpengine/atlas-next}
- Make sure you download all necessary dependencies by running `npm install`
- Build the package using the command `npm run build`

## Copy the package into your Nextjs application
Make sure you have a Nextjs app to test locally with, for example this [headless nextjs]{https://github.com/diarmuidie/headless-nextjs} app.

1. Copy the the npm package files (`dist/`, `package.json` and `README.md`) to your project by running:
   ```
   rsync -av ../../../atlas-next/dist ../../../atlas-next/dist/package.json ../../../atlas-next/dist/README.md ./atlas-next`
   ```
   **NOTE**: if using the headless nextjs app above, run the command from the `js/basic` directory.

   **NOTE**: You may need to alter the `../../../atlas-next` part of the command to correctly point at the atlas-next project.
   
   If successful, you should see changes in the atlas-next folder of the repo (or a new folder by that name appearing if one didn’t exist before).
2. Run `npm install ./atlas-next` to install the cache handler like any other npm package

After every change you will need to run `npm run build` in the `atlas-next` repo and repeat steps 1 and 2 above.

## Run your app locally
- Follow the directions in the [README.md](README.md) file for instructions on how to use the package
