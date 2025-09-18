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
export const STATIC_NODE_IMPORT_REGEX =
  /^import\s.+from\s+['"]node:[^'"]+['"];?\s*$/gm;
export const NODE_BRANCH_REGEX =
  /const\s+isNodeOrBun\s*=.+?;\s*if\s*\(\s*isNodeOrBun\s*\)\s*\{\s*return\s+globalThis\.WebAssembly\.compile\([\s\S]*?import\(["']node:fs\/promises["']\)[\s\S]*?\);\s*\}\s*else\s*\{\s*return\s+await\s+globalThis\.WebAssembly\.compileStreaming\(globalThis\.fetch\(url\)\);\s*\}/ms;
export const DYNAMIC_NODE_IMPORT_REGEX = /import\(["']node:[^"']+["']\)/g;

export const STANDALONE_ENVIRONMENT_FOLDER = ".use-wasm-temp";
