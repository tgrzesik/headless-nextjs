import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cache-handler/cacheHandler.ts"],
  format: ["cjs", "esm"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@wpengine/atlas-next"]
});
