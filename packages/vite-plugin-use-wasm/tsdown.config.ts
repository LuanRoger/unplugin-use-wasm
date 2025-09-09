import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  tsconfig: "tsconfig.json",
  format: "esm",
  sourcemap: true,
  external: ["vite"],
});
