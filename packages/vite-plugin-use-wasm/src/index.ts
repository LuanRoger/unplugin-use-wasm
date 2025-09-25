import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import asc from "assemblyscript/asc";
import { remove } from "fs-extra";
import type { Plugin } from "vite";

import {
  BINDINGS_DEFAULT_WASM_URL_REGEX,
  D_TS_EXTENSION,
  JS_EXTENSION,
  SOURCE_MAP_EXTENSION,
  TS_EXTENSION,
  WASM_DIRECTIVE_REGEX,
  WASM_EXTENSION,
  WASM_TEXT_EXTENSION,
} from "./constants";
import type { PluginOptions } from "./options";
import {
  StandaloneEnvironment,
  adaptBindingsForBrowser,
  getCompilerFlags,
} from "./utils";

export default function useWasm(options?: PluginOptions): Plugin {
  const {
    compilerOptions,
    browser,
    emitWasmTextFile,
    emitDtsFile,
    emitSourceMap,
  } = options || {
    browser: true,
    emitDtsFile: true,
    emitSourceMap: false,
    emitWasmTextFile: false,
  };

  return {
    name: "use-wasm",
    enforce: "pre",
    async load(id) {
      const isTsFile = id.endsWith(TS_EXTENSION);
      if (!isTsFile) return null;

      try {
        const code = await readFile(id, "utf-8");
        const hasWasmDirective = WASM_DIRECTIVE_REGEX.test(code.trim());
        if (!hasWasmDirective) {
          return null;
        }

        return code;
      } catch {
        return null;
      }
    },

    async transform(code, id) {
      const hasWasmDirective = WASM_DIRECTIVE_REGEX.test(code.trim());
      if (!hasWasmDirective) {
        return null;
      }

      const idUniqueHash = createHash("sha1")
        .update(id)
        .digest("hex")
        .slice(0, 8);
      const fileName = `${idUniqueHash}-${path.basename(id, TS_EXTENSION)}`;
      const cwd = process.cwd();
      const tsFilePath = `${fileName}${TS_EXTENSION}`;
      const tempTsFilePath = path.join(path.dirname(id), tsFilePath);
      const wasmFileName = `${fileName}${WASM_EXTENSION}`;
      const wasmTextFileName = `${fileName}${WASM_TEXT_EXTENSION}`;
      const jsBindingsFileName = `${fileName}${JS_EXTENSION}`;
      const dTsFileName = `${fileName}${D_TS_EXTENSION}`;
      const sourceMapFileName = `${fileName}${SOURCE_MAP_EXTENSION}`;

      const standaloneEnvironment = new StandaloneEnvironment(cwd);
      await standaloneEnvironment.setup();
      const outFilePath = path.join(
        standaloneEnvironment.standaloneOutputPath,
        wasmFileName
      );
      const textFilePath = path.join(
        standaloneEnvironment.standaloneOutputPath,
        wasmTextFileName
      );
      const jsBindingsPath = path.join(
        standaloneEnvironment.standaloneOutputPath,
        jsBindingsFileName
      );
      const dTsPath = path.join(
        standaloneEnvironment.standaloneOutputPath,
        dTsFileName
      );
      const sourceMapPath = path.join(
        standaloneEnvironment.standaloneOutputPath,
        sourceMapFileName
      );

      const userDefinedFlags =
        compilerOptions !== undefined ? getCompilerFlags(compilerOptions) : [];
      const compilerFlags = [
        id,
        "--outFile",
        outFilePath,
        "--textFile",
        textFilePath,
        "--sourceMap",
        sourceMapPath,
        "--bindings",
        "esm",
        ...userDefinedFlags,
      ];

      try {
        const { error } = await asc.main(compilerFlags, {
          stdout: process.stdout,
          stderr: process.stderr,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        await standaloneEnvironment.clean();
        if (error instanceof Error) {
          throw new Error(
            `AssemblyScript compilation failed: ${error.message}`
          );
        }
      }

      const [
        wasmBinaryContent,
        wasmTextContent,
        generatedBindings,
        dTsContent,
        sourceMapContent,
      ] = await Promise.all([
        readFile(outFilePath),
        readFile(textFilePath, "utf-8"),
        readFile(jsBindingsPath, "utf-8"),
        readFile(dTsPath, "utf-8"),
        readFile(sourceMapPath, "utf-8"),
        remove(tempTsFilePath),
      ]);

      const isViteDev =
        typeof this.meta?.watchMode !== "undefined" && this.meta.watchMode;

      if (isViteDev) {
        const wasmBase64 = wasmBinaryContent.toString("base64");
        const wasmDataUrl = `data:application/wasm;base64,${wasmBase64}`;

        const devModeBindings = generatedBindings.replace(
          BINDINGS_DEFAULT_WASM_URL_REGEX,
          `"${wasmDataUrl}"`
        );

        try {
          await standaloneEnvironment.clean();
        } catch {
          this.warn("Not possible to clean standalone environment");
        }

        return {
          code: devModeBindings,
          map: sourceMapContent,
        };
      } else {
        const wasmDistPath = path.join("wasm", wasmFileName);
        const wasmTextDistPath = path.join("wasm", wasmTextFileName);
        const dTsDistPath = path.join("wasm", dTsFileName);
        const sourceMapDistPath = path.join("wasm", sourceMapFileName);

        const referenceId = this.emitFile({
          type: "asset",
          fileName: wasmDistPath,
          source: wasmBinaryContent,
        });
        if (emitWasmTextFile) {
          this.emitFile({
            type: "asset",
            fileName: wasmTextDistPath,
            source: wasmTextContent,
          });
        }
        if (emitDtsFile) {
          this.emitFile({
            type: "asset",
            fileName: dTsDistPath,
            source: dTsContent,
          });
        }
        if (emitSourceMap) {
          this.emitFile({
            type: "asset",
            fileName: sourceMapDistPath,
            source: sourceMapContent,
          });
        }

        try {
          await standaloneEnvironment.clean();
        } catch {
          this.warn("Not possible to clean standalone environment");
        }

        const tsBindings = browser
          ? adaptBindingsForBrowser(generatedBindings)
          : generatedBindings;
        const resolvedBindings = tsBindings.replace(
          BINDINGS_DEFAULT_WASM_URL_REGEX,
          `new URL(import.meta.ROLLUP_FILE_URL_${referenceId})`
        );
        return {
          code: resolvedBindings,
          map: sourceMapContent,
        };
      }
    },
  };
}
