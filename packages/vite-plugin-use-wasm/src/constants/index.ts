export const WASM_EXTENSION = ".wasm";
export const WASM_MAP_EXTENSION = ".wasm.map";
export const WASM_TEXT_EXTENSION = ".wat";
export const TS_EXTENSION = ".ts";
export const D_TS_EXTENSION = ".d.ts";
export const JS_EXTENSION = ".js";
export const SOURCE_MAP_EXTENSION = ".map";

export const WASM_MODULE_DIRECTIVE = "use wasm";
export const WASM_DIRECTIVE_REGEX = /^["']use wasm["'];?\s*/;
export const BINDINGS_DEFAULT_WASM_URL_REGEX =
  /new URL\(".*?\.wasm", import\.meta\.url\)/g;

export const STANDALONE_ENVIRONMENT_FOLDER = ".use-wasm-temp";
