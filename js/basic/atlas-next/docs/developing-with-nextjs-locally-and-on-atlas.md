# Developing with Next.js Locally and on Atlas

This Document explains the steps necessary to test your local changes in a Next.js application

## Clone the Atlas-next repository and build the package
1. Clone the atlas-next repository from [GitHub](https://github.com/wpengine/atlas-next)
2. Make sure you download all necessary dependencies by running `npm install --no-package-lock`
3. Build the package using the command `npm run build`

## Copy the package into your Next.js application
Make sure you have a Nextjs app to test locally with, for example this [headless nextjs](https://github.com/diarmuidie/headless-nextjs) app.

1. Copy the the npm package files (`dist/`, `package.json` and `README.md`) to your Next.js project by running an rsync from the root of your Next.js app:
   ```
   rsync -av ../../../atlas-next/dist ../../../atlas-next/package.json ../../../atlas-next/README.md ./atlas-next`
   ```
   **NOTE**: You may need to alter the `../../../atlas-next` part of the command to correctly point at the atlas-next project

   If successful, you should see changes in the atlas-next folder of the repo
2. Run `npm install ./atlas-next` to install the cache handler like any other npm package

After every change you will need to run `npm run build` (step #3) in the `atlas-next` repo and repeat steps 1 and 2 above.

Follow the directions in the [README.md](README.md) file for instructions on how to use the package.

## Run your changes on Atlas (optional)
You can commit the atlas-next folder and package.json change in your Atlas repo so they get deployed on Atlas.
