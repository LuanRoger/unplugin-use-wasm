/** biome-ignore-all lint/correctness/useHookAtTopLevel: This is not a React component */
import useWasm from "@rog/vite-plugin-use-wasm";
import Inspect from "vite-plugin-inspect";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [useWasm(), Inspect(), tailwindcss(), react()],
});
