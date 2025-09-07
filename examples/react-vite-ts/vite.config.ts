import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { wasmDirective } from "@rog/plugin-use-wasm";

export default defineConfig({
  plugins: [react(), wasmDirective()],
});
