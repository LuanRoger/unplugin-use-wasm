/** biome-ignore-all lint/correctness/useHookAtTopLevel: This is not a React component */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import useWasm from "vite-plugin-use-wasm";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
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
