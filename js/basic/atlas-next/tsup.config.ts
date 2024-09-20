import { defineConfig } from "tsup";
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

export default defineConfig({
  entry: ["src/api/index.ts", "src/cache-handler/index.ts", "src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@wpengine/atlas-next/cache-handler", "@wpengine/atlas-next/api"],
  esbuildPlugins: [esbuildPluginVersionInjector()]
});
