import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "vite/index": "src/vite.ts",
    "rollup/index": "src/rollup.ts",
    "rolldown/index": "src/rolldown.ts",
  },
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
