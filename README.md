# unplugin-use-wasm

[![npm version](https://img.shields.io/npm/v/unplugin-use-wasm?style=flat&logo=npm&labelColor=CB3837)](https://www.npmjs.com/package/unplugin-use-wasm)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![NPM License](https://img.shields.io/npm/l/unplugin-use-wasm?style=flat)](https://github.com/LuanRoger/unplugin-use-wasm/blob/main/LICENSE)

A Vite plugin that adds support for the `"use wasm"` directive in TypeScript files, enabling seamless integration and compilation of WebAssembly modules.

It uses the [AssemblyScript](https://www.assemblyscript.org/) compiler to compile TypeScript code into WebAssembly. AssemblyScript is a subset of TypeScript, it allows developers to write high-performance code that can be executed in a WebAssembly environment. So not every TypeScript code can be compiled to WebAssembly. For more info on that, check the [AssemblyScript documentation](https://www.assemblyscript.org/introduction.html).

## Features

- **Multiple Bundler Support**: Works seamlessly with Vite, Rollup, and Rolldown. Other bundlers may work but are not officially supported, since this is a unplugin.
- **Easy Integration**: Simply add the plugin to your bundle configuration and use the `"use wasm"` directive in your TypeScript files.
- **Automatic Compilation**: The plugin automatically compiles TypeScript files with the `"use wasm"` directive to WebAssembly using AssemblyScript.
- **Seamless Imports**: Import and use WebAssembly modules in your application just like regular TypeScript modules.
- **Optimized Performance**: WebAssembly modules are optimized for performance, making them ideal for computationally intensive tasks.
- **Vite First-Class Compatibility**: Fully compatible with Vite, leveraging its fast build times and hot module replacement (HMR).
- **Customizable**: Configure the AssemblyScript compiler flags and options to suit your project's needs.

## Installation

```bash
npm install unplugin-use-wasm --save-dev
```

### AssemblyScript types

This package also have the AssemblyScript portable types, so you do not get warnings when you try to use the types `i32`, `f64`, `bool`, etc.

In your `tsconfig.json`, add the following to the `compilerOptions`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/unplugin-use-wasm/dist/types"],
    "types": ["assemblyscript"]
  }
}
```

## Usage

First, add the plugin to your bundler configuration file, here I will use Vite for example (`vite.config.ts` or `vite.config.js`):

```ts
import { defineConfig } from "vite";
import useWasm from "unplugin-use-wasm/vite";

export default defineConfig({
  plugins: [
    useWasm({
      browser: true,
    }),
  ],
});
```

> The import path can be changed to `unplugin-use-wasm/rollup` or `unplugin-use-wasm/rolldown` depending on the bundler you are using.

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

- [React + Vite + TypeScript Example](https://github.com/LuanRoger/unplugin-use-wasm/tree/main/examples/react-vite-ts)
- [Rolldown](https://github.com/LuanRoger/unplugin-use-wasm/tree/main/examples/rolldown-lib)
