/**
 * AssemblyScript compiler options that can be passed to the AssemblyScript compiler.
 * These options control how the AssemblyScript code is compiled to WebAssembly.
 */
export interface AssemblyScriptOptions {
  /**
   * Enable optimization of the generated WebAssembly module.
   * When enabled, produces smaller and faster WebAssembly code.
   * @default undefined (uses AssemblyScript default)
   */
  optimize?: boolean;

  /**
   * Set the optimization level (0-3).
   * Higher levels increase compilation time but may yield better performance.
   * @default undefined (uses AssemblyScript default)
   */
  optimizeLevel?: 0 | 1 | 2 | 3;

  /**
   * Set the size optimization level (0-3).
   * Higher levels prioritize smaller code size over speed.
   * @default undefined (uses AssemblyScript default)
   */
  shrinkLevel?: 0 | 1 | 2;

  /**
   * Re-optimizes until no further improvements can be made.
   * @default undefined (uses AssemblyScript default)
   */
  converge?: boolean;

  /**
   * Replaces assertions with just their value without trapping.
   * @default undefined (uses AssemblyScript default)
   */
  noAssert?: boolean;

  /**
   * Specify the runtime variant to use.
   * - "incremental": Full garbage collector with incremental collection
   * - "minimal": Minimal runtime with basic memory management
   * - "stub": Stub runtime for maximum performance (no GC)
   * @default undefined (uses AssemblyScript default)
   */
  runtime?: "incremental" | "minimal" | "stub";

  /**
   * Export the runtime helpers to allow manual memory management.
   * Useful when you need direct access to memory allocation functions.
   * @default undefined (uses AssemblyScript default)
   */
  exportRuntime?: boolean;

  /**
   * Import memory from the host environment instead of creating it.
   * Allows sharing memory between multiple WebAssembly modules.
   * @default undefined (uses AssemblyScript default)
   */
  importMemory?: boolean;

  /**
   * Initial memory size in WebAssembly pages (64KB each).
   * Sets the minimum amount of memory the module will have available.
   * @default undefined (uses AssemblyScript default of 0)
   */
  initialMemory?: number;

  /**
   * Maximum memory size in WebAssembly pages (64KB each).
   * Sets the upper limit for memory growth. Must be greater than initialMemory.
   * @default undefined (allows unlimited growth up to WebAssembly limits)
   */
  maximumMemory?: number;

  /**
   * Enable shared memory support for multi-threading.
   * Requires maximumMemory to be set and threads feature to be enabled.
   * @default undefined (uses AssemblyScript default)
   */
  sharedMemory?: boolean;

  /**
   * Include debug information in the generated WebAssembly module.
   * Useful for debugging but increases module size.
   * @default undefined (uses AssemblyScript default)
   */
  debug?: boolean;
}

/**
 * Configuration options for the unplugin-use-wasm plugin.
 * Controls both the AssemblyScript compilation process and the plugin's behavior.
 */
export interface PluginOptions {
  /**
   * AssemblyScript compiler-specific options.
   * These options are passed directly to the AssemblyScript compiler.
   * @default undefined
   */
  compilerOptions?: AssemblyScriptOptions;

  /**
   * Whether to adapt the generated bindings for browser environments.
   * When enabled, modifies imports/exports to be browser-compatible.
   * @default true
   */
  browser?: boolean;

  /**
   * Whether to emit the WebAssembly text format (.wat) file as an asset.
   * The .wat file is a human-readable representation of the WebAssembly module.
   * @default false
   */
  emitWasmTextFile?: boolean;

  /**
   * Whether to emit TypeScript declaration (.d.ts) files as assets.
   * Provides type definitions for the compiled WebAssembly module.
   * @default true
   */
  emitDtsFile?: boolean;

  /**
   * Whether to emit source map (.map) files as assets.
   * Enables debugging by mapping compiled code back to original source.
   * @default false
   */
  emitSourceMap?: boolean;
}
