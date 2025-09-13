import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  tsconfig: "tsconfig.json",
  format: "esm",
  sourcemap: true,
  target: "esnext",
  external: ["assemblyscript"],
  copy: [
    {
      from: "src/types/assemblyscript.d.ts",
      to: "dist/types/assemblyscript.d.ts",
    },
  ],
});
