import { defineConfig } from "tsdown";
import useWasm from "unplugin-use-wasm/rolldown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  plugins: [
    useWasm({
      browser: false,
      emitDtsFile: false,
      emitSourceMap: false,
      emitWasmTextFile: true,
    }),
  ],
  dts: true,
  tsconfig: "tsconfig.build.json",
  format: "esm",
  sourcemap: true,
});
