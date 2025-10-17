# vite-plugin-use-wasm

[![npm version](https://img.shields.io/npm/v/vite-plugin-use-wasm?style=flat&logo=npm&labelColor=CB3837)](https://www.npmjs.com/package/vite-plugin-use-wasm)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![NPM License](https://img.shields.io/npm/l/vite-plugin-use-wasm?style=flat)](https://github.com/LuanRoger/vite-plugin-use-wasm/blob/main/LICENSE)

A Vite plugin that adds support for the `"use wasm"` directive in TypeScript files, enabling seamless integration and compilation of WebAssembly modules.

It uses the [AssemblyScript](https://www.assemblyscript.org/) compiler to compile TypeScript code into WebAssembly. AssemblyScript is a subset of TypeScript, it allows developers to write high-performance code that can be executed in a WebAssembly environment. So not every TypeScript code can be compiled to WebAssembly. For more info on that, check the [AssemblyScript documentation](https://www.assemblyscript.org/introduction.html).

## Features

- **Easy Integration**: Simply add the plugin to your Vite configuration and use the `"use wasm"` directive in your TypeScript files.
- **Automatic Compilation**: The plugin automatically compiles TypeScript files with the `"use wasm"` directive to WebAssembly using AssemblyScript.
- **Seamless Imports**: Import and use WebAssembly modules in your application just like regular TypeScript modules.
- **Optimized Performance**: WebAssembly modules are optimized for performance, making them ideal for computationally intensive tasks.
- **Vite Compatibility**: Fully compatible with Vite, leveraging its fast build times and hot module replacement (HMR).
- **Customizable**: Configure the AssemblyScript compiler flags and options to suit your project's needs.

## Installation

```bash
npm install vite-plugin-use-wasm --save-dev
```

### AssemblyScript types

This package also have the AssemblyScript portable types, so you do not get warnings when you try to use the types `i32`, `f64`, `bool`, etc.

In your `tsconfig.json`, add the following to the `compilerOptions`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/vite-plugin-use-wasm/dist/types"],
    "types": ["assemblyscript"],
  }
}
```

## Usage

First, add the plugin to your Vite configuration file (`vite.config.ts` or `vite.config.js`):

```ts
import { defineConfig } from "vite";
import useWasm from "vite-plugin-use-wasm";

export default defineConfig({
  plugins: [useWasm()],
});
```

Then, you can use the `"use wasm"` directive in your TypeScript files to indicate that the file should be compiled to WebAssembly:

```ts
// sum.ts
"use wasm";

export function sum(a: i32, b: i32): i32 {
  return a + b;
}
```

You can then import and use the WebAssembly module in your application:

```ts
import { sum } from "./sum.ts";

const result = sum(1, 2);
console.log(result); // 3
```

## Examples

- [React + Vite + TypeScript Example](https://github.com/LuanRoger/vite-plugin-use-wasm/tree/main/examples/react-vite-ts)
