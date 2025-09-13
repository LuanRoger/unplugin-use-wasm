import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  tsconfig: "tsconfig.json",
  format: "esm",
  sourcemap: true,
  target: "esnext",
  external: ["vite", "assemblyscript", "fs-extra"],
});
