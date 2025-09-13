/** biome-ignore-all lint/correctness/useHookAtTopLevel: This is not a React component */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import useWasm from "vite-plugin-use-wasm";

export default defineConfig({
  plugins: [useWasm(), Inspect(), tailwindcss(), react()],
});
