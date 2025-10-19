/** biome-ignore-all lint/correctness/useHookAtTopLevel: This is not a React component */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import useWasm from "unplugin-use-wasm/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [
    useWasm({
      browser: true,
      emitWasmTextFile: true,
      compilerOptions: {
        optimize: true,
        optimizeLevel: 3,
        shrinkLevel: 0,
        noAssert: true,
        converge: true,
      },
    }),
    Inspect(),
    tailwindcss(),
    react(),
  ],
});
