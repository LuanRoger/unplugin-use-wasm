import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import asc from "assemblyscript/asc";
import { remove } from "fs-extra";
import type { Plugin } from "rollup";
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
import { StandaloneEnvironment } from "./utils";

interface AssemblyScriptOptions {
  optimize?: boolean;
  runtime?: "incremental" | "minimal" | "stub";
  exportRuntime?: boolean;
  importMemory?: boolean;
  initialMemory?: number;
  maximumMemory?: number;
  sharedMemory?: boolean;
  debug?: boolean;
}

function getCompilerFlags(options: AssemblyScriptOptions): string[] {
  const flags: string[] = [];

  if (options.optimize) {
    flags.push("--optimize");
  }

  if (options.runtime) {
    flags.push("--runtime", options.runtime);
  }

  if (options.importMemory) {
    flags.push("--importMemory");
  }

  if (options.initialMemory) {
    flags.push("--initialMemory", options.initialMemory.toString());
  }

  if (options.maximumMemory) {
    flags.push("--maximumMemory", options.maximumMemory.toString());
  }

  if (options.sharedMemory) {
    flags.push("--sharedMemory");
  }

  if (options.debug) {
    flags.push("--debug");
  }

  return flags;
}

export function wasmDirective(options?: AssemblyScriptOptions): Plugin {
  return {
    name: "use-wasm",
    async load(id: string) {
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

    async transform(code: string, id: string) {
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

      const compilerOptions = [
        id,
        "--outFile",
        outFilePath,
        "--textFile",
        textFilePath,
        "--sourceMap",
        sourceMapPath,
        "--bindings",
        "esm",
        "-Ospeed",
        "--noAssert",
        "--converge",
        "--optimize",
        ...(options !== undefined ? getCompilerFlags(options) : []),
      ];

      try {
        const { error } = await asc.main(compilerOptions, {
          stdout: process.stdout,
          stderr: process.stderr,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
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

      const wasmDistPath = path.join("wasm", wasmFileName);
      const wasmTextDistPath = path.join("wasm", wasmTextFileName);
      const dTsDistPath = path.join("wasm", dTsFileName);

      const referenceId = this.emitFile({
        type: "asset",
        fileName: wasmDistPath,
        source: wasmBinaryContent,
      });
      this.emitFile({
        type: "asset",
        fileName: wasmTextDistPath,
        source: wasmTextContent,
      });
      this.emitFile({
        type: "asset",
        fileName: dTsDistPath,
        source: dTsContent,
      });

      try {
        await standaloneEnvironment.clean();
      } catch {
        this.warn("Not possible to clean standalone environment");
      }

      const resolvedBindings = generatedBindings.replace(
        BINDINGS_DEFAULT_WASM_URL_REGEX,
        `new URL(import.meta.ROLLUP_FILE_URL_${referenceId})`
      );
      return {
        code: resolvedBindings,
        map: sourceMapContent,
      };
    },
  };
}
