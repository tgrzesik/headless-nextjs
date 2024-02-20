import { defineConfig } from "tsup";
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

export default defineConfig({
  entry: ["src/cache-handler/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@wpengine/atlas-next"],
  esbuildPlugins: [esbuildPluginVersionInjector()]
});
