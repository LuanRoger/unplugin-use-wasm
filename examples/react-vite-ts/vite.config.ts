import { wasmDirective } from "@rog/vite-plugin-use-wasm";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [wasmDirective(), tailwindcss(), react()],
});
