import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathExists } from "fs-extra";
import { beforeAll, describe, expect, test, vi } from "vitest";
import useWasm from "../src";
import { STANDALONE_ENVIRONMENT_FOLDER } from "../src/constants";

interface EmittedAssetMock {
  type: "asset";
  fileName: string;
  source: string | Buffer;
}
interface PluginContextMock {
  meta: { watchMode: boolean };
  warn: (msg: string) => void;
  emitFile: (emittedFile: EmittedAssetMock) => string;
  getEmitted: () => EmittedAssetMock[];
  getWarnings: () => string[];
}

interface MinimalTransformResult {
  code: string;
  map?: unknown;
}

async function createFixtureFile(code: string): Promise<{ filePath: string }> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "use-wasm-fixture-"));
  const filePath = path.join(tmpDir, `fixture-${Date.now()}.ts`);
  await writeFile(filePath, code, "utf-8");
  return { filePath };
}

function createPluginContext({
  watchMode,
}: {
  watchMode: boolean;
}): PluginContextMock {
  const warnings: string[] = [];
  const emitted: EmittedAssetMock[] = [];
  const ctx: PluginContextMock = {
    meta: { watchMode },
    warn: (msg: string) => {
      warnings.push(msg);
    },
    emitFile: (emittedFile: EmittedAssetMock) => {
      emitted.push(emittedFile);
      if (emittedFile.fileName.endsWith(".wasm")) return "REF_WASM";
      return "REF_OTHER";
    },
    getEmitted: () => emitted,
    getWarnings: () => warnings,
  };
  return ctx;
}

function getTransformFn(plugin: ReturnType<typeof useWasm>["transform"]) {
  return plugin as unknown as (
    this: PluginContextMock,
    code: string,
    id: string,
  ) => Promise<MinimalTransformResult | null>;
}

const SIMPLE_AS_CODE = `"use wasm";\nexport function add(a: i32, b: i32): i32 { return a + b; }`;
const SIMPLE_AS_CODE_SINGLE_QUOTE = `'use wasm';\nexport function sub(a: i32, b: i32): i32 { return a - b; }`;
const DIRECTIVE_AT_END = `export function mul(a: i32, b: i32): i32 { return a * b; }\n"use wasm";`;
const DIRECTIVE_AT_END_SINGLE = `export function div(a: i32, b: i32): i32 { return a / b; }\n'use wasm';`;
const DIRECTIVE_IN_FUNCTION_STRING = `export function foo(): string { const x = "use wasm"; return x; }`;
const DIRECTIVE_AFTER_COMMENT = `// leading comment\n"use wasm";\nexport const value: i32 = 1;`;
const DIRECTIVE_WITH_LEADING_BLANKS = `\n\n'use wasm'\nexport function inc(a: i32): i32 { return a + 1; }`;
const DIRECTIVE_NO_SEMICOLON = `"use wasm"\nexport function dec(a: i32): i32 { return a - 1; }`;

beforeAll(() => {
  vi.setConfig({ testTimeout: 30_000 });
});

describe("vite-plugin-use-wasm", () => {
  test("load returns null for non-TS file", async () => {
    const plugin = useWasm();
    const result = await (
      plugin.load as (id: string) => Promise<string | null>
    ).call({}, "some-file.js");
    expect(result).toBeNull();
  });

  test("load returns code when directive present", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
    const result = await (
      plugin.load as (id: string) => Promise<string | null>
    ).call({}, filePath);
    expect(result).toContain("use wasm");
  });

  test("transform returns null when directive missing", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile("export const x = 1;");
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(
      createPluginContext({ watchMode: false }),
      "export const x = 1;",
      filePath,
    );
    expect(result).toBeNull();
  });

  test("dev mode embeds wasm as data URL", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
    const ctx = createPluginContext({ watchMode: true });
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

    expect(result).not.toBeNull();
    if (result === null) {
      throw new Error("Expected transform result, got null");
    }
    expect(result.code).toContain("data:application/wasm;base64,");
    expect(result.code).not.toContain("ROLLUP_FILE_URL_");

    const standaloneExists = await pathExists(
      path.join(process.cwd(), STANDALONE_ENVIRONMENT_FOLDER),
    );
    expect(standaloneExists).toBe(false);
  });

  test("production mode emits assets and references rollup file url", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
    const ctx = createPluginContext({ watchMode: false });
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

    expect(result).not.toBeNull();
    if (result === null) {
      throw new Error("Expected transform result, got null");
    }
    expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");

    const emitted = ctx.getEmitted();
    expect(emitted.length).toBe(2);
    const fileNames = emitted.map((e) => e.fileName).sort();
    expect(fileNames.some((n) => n.endsWith(".wasm"))).toBe(true);
    expect(fileNames.some((n) => n.endsWith(".wat"))).toBe(false);
    expect(fileNames.some((n) => n.endsWith(".d.ts"))).toBe(true);

    const standaloneExists = await pathExists(
      path.join(process.cwd(), STANDALONE_ENVIRONMENT_FOLDER),
    );
    expect(standaloneExists).toBe(false);
  });

  test("single quote directive compiles (dev mode)", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(SIMPLE_AS_CODE_SINGLE_QUOTE);
    const ctx = createPluginContext({ watchMode: true });
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(
      ctx,
      SIMPLE_AS_CODE_SINGLE_QUOTE,
      filePath,
    );
    expect(result).not.toBeNull();
    if (result === null) throw new Error("Expected result");
    expect(result.code).toContain("data:application/wasm;base64,");
  });

  test("directive at end is ignored", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_AT_END);
    const ctx = createPluginContext({ watchMode: true });
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(ctx, DIRECTIVE_AT_END, filePath);
    expect(result).toBeNull();
  });

  test("directive at end (single quote) is ignored", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_AT_END_SINGLE);
    const ctx = createPluginContext({ watchMode: false });
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(
      ctx,
      DIRECTIVE_AT_END_SINGLE,
      filePath,
    );
    expect(result).toBeNull();
  });

  test("string inside function does not trigger", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_IN_FUNCTION_STRING);
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(
      createPluginContext({ watchMode: true }),
      DIRECTIVE_IN_FUNCTION_STRING,
      filePath,
    );
    expect(result).toBeNull();
  });

  test("directive after comment is ignored", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_AFTER_COMMENT);
    const transformFn = getTransformFn(plugin.transform);
    const result = await transformFn.call(
      createPluginContext({ watchMode: true }),
      DIRECTIVE_AFTER_COMMENT,
      filePath,
    );
    expect(result).toBeNull();
  });

  test("directive with leading blank lines works", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_WITH_LEADING_BLANKS);
    const transformFn = getTransformFn(plugin.transform);
    const ctx = createPluginContext({ watchMode: true });
    const result = await transformFn.call(
      ctx,
      DIRECTIVE_WITH_LEADING_BLANKS,
      filePath,
    );
    expect(result).not.toBeNull();
    if (result === null) throw new Error("Expected result");
    expect(result.code).toContain("data:application/wasm;base64,");
  });

  test("directive without semicolon works", async () => {
    const plugin = useWasm();
    const { filePath } = await createFixtureFile(DIRECTIVE_NO_SEMICOLON);
    const transformFn = getTransformFn(plugin.transform);
    const ctx = createPluginContext({ watchMode: false });
    const result = await transformFn.call(
      ctx,
      DIRECTIVE_NO_SEMICOLON,
      filePath,
    );
    expect(result).not.toBeNull();
    if (result === null) throw new Error("Expected result");
    expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
  });

  describe("PluginOptions", () => {
    test("default options work correctly", async () => {
      const plugin = useWasm();
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");

      const emitted = ctx.getEmitted();
      expect(emitted.length).toBe(2);

      const fileNames = emitted.map((e) => e.fileName);
      expect(fileNames.some((n) => n.endsWith(".wasm"))).toBe(true);
      expect(fileNames.some((n) => n.endsWith(".d.ts"))).toBe(true);
      expect(fileNames.some((n) => n.endsWith(".wat"))).toBe(false);
      expect(fileNames.some((n) => n.endsWith(".map"))).toBe(false);
    });

    test("emitWasmTextFile option emits .wat file", async () => {
      const plugin = useWasm({ emitWasmTextFile: true });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      const emitted = ctx.getEmitted();
      const fileNames = emitted.map((e) => e.fileName);
      expect(fileNames.some((n) => n.endsWith(".wat"))).toBe(true);
    });

    test("emitDtsFile=false does not emit .d.ts file", async () => {
      const plugin = useWasm({ emitDtsFile: false });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      const emitted = ctx.getEmitted();
      const fileNames = emitted.map((e) => e.fileName);
      expect(fileNames.some((n) => n.endsWith(".d.ts"))).toBe(false);
    });

    test("emitSourceMap option emits .map file", async () => {
      const plugin = useWasm({ emitSourceMap: true });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      const emitted = ctx.getEmitted();
      const fileNames = emitted.map((e) => e.fileName);
      expect(fileNames.some((n) => n.endsWith(".map"))).toBe(true);
    });

    test("all emit options enabled emits all file types", async () => {
      const plugin = useWasm({
        emitWasmTextFile: true,
        emitDtsFile: true,
        emitSourceMap: true,
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      const emitted = ctx.getEmitted();
      expect(emitted.length).toBe(4);

      const fileNames = emitted.map((e) => e.fileName);
      expect(fileNames.some((n) => n.endsWith(".wasm"))).toBe(true);
      expect(fileNames.some((n) => n.endsWith(".wat"))).toBe(true);
      expect(fileNames.some((n) => n.endsWith(".d.ts"))).toBe(true);
      expect(fileNames.some((n) => n.endsWith(".map"))).toBe(true);
    });

    test("browser=false does not adapt bindings for browser", async () => {
      const plugin = useWasm({ browser: false });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");

      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.optimize adds --optimize flag", async () => {
      const plugin = useWasm({
        compilerOptions: { optimize: true },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.runtime sets runtime option", async () => {
      const plugin = useWasm({
        compilerOptions: { runtime: "minimal" },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.importMemory sets import memory option", async () => {
      const plugin = useWasm({
        compilerOptions: { importMemory: true },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.initialMemory sets initial memory option", async () => {
      const plugin = useWasm({
        compilerOptions: { initialMemory: 1 },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.maximumMemory sets maximum memory option", async () => {
      const plugin = useWasm({
        compilerOptions: { maximumMemory: 256 },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("compilerOptions.sharedMemory sets shared memory option", async () => {
      const plugin = useWasm({
        compilerOptions: {
          sharedMemory: true,
          maximumMemory: 256,
        },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);

      try {
        const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);
        expect(result).not.toBeNull();
        if (result !== null) {
          expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "AssemblyScript compilation failed",
        );
      }
    });

    test("compilerOptions.debug sets debug option", async () => {
      const plugin = useWasm({
        compilerOptions: { debug: true },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("multiple compilerOptions work together", async () => {
      const plugin = useWasm({
        compilerOptions: {
          optimize: true,
          runtime: "incremental",
          importMemory: true,
          initialMemory: 1,
          maximumMemory: 256,
          debug: true,
        },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });

    test("options work correctly in dev mode", async () => {
      const plugin = useWasm({
        emitWasmTextFile: true,
        emitDtsFile: true,
        emitSourceMap: true,
        compilerOptions: { optimize: true },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: true });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");

      expect(result.code).toContain("data:application/wasm;base64,");
      expect(result.code).not.toContain("ROLLUP_FILE_URL_");

      const emitted = ctx.getEmitted();
      expect(emitted.length).toBe(0);
    });

    test("getCompilerFlags function coverage", async () => {
      const plugin = useWasm({
        compilerOptions: {
          optimize: false,
          runtime: "stub",
          exportRuntime: true,
          importMemory: false,
          initialMemory: 2,
          maximumMemory: 128,
          sharedMemory: false,
          debug: false,
        },
      });
      const { filePath } = await createFixtureFile(SIMPLE_AS_CODE);
      const ctx = createPluginContext({ watchMode: false });
      const transformFn = getTransformFn(plugin.transform);
      const result = await transformFn.call(ctx, SIMPLE_AS_CODE, filePath);

      expect(result).not.toBeNull();
      if (result === null) throw new Error("Expected result");
      expect(result.code).toContain("ROLLUP_FILE_URL_REF_WASM");
    });
  });
});
