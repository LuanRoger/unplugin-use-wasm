import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { wasmDirective } from "@rog/plugin-use-wasm";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [wasmDirective(), tailwindcss(), react()],
});
