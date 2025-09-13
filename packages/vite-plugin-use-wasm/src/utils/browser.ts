import {
  DYNAMIC_NODE_IMPORT_REGEX,
  NODE_BRANCH_REGEX,
  STATIC_NODE_IMPORT_REGEX,
} from "../constants";

export function sanitizeBindingsForBrowser(code: string): string {
  let out = code.replace(STATIC_NODE_IMPORT_REGEX, "");

  out = out.replace(
    NODE_BRANCH_REGEX,
    `return await (async () => {
      if (globalThis.WebAssembly.compileStreaming) {
        try { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); } catch {}
      }
      const res = await globalThis.fetch(url);
      const bytes = await res.arrayBuffer();
      return await globalThis.WebAssembly.compile(bytes);
    })()`
  );

  out = out.replace(
    DYNAMIC_NODE_IMPORT_REGEX,
    "Promise.reject(new Error('node: modules are unavailable in browser'))"
  );

  return out;
}
