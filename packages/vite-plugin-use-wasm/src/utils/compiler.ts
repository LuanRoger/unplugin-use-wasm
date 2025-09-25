import type { AssemblyScriptFeatures, AssemblyScriptOptions } from "../options";

function getFeaturesFlags(features: AssemblyScriptFeatures): string[] {
  const flags: string[] = [];

  for (const [feature, enabled] of Object.entries(features)) {
    if (enabled) {
      flags.push(`--enable`, feature);
    } else {
      flags.push(`--disable`, feature);
    }
  }

  return flags;
}

export function getCompilerFlags(options: AssemblyScriptOptions): string[] {
  const flags: string[] = [];

  if (options.optimize) {
    flags.push("--optimize");
  }

  if (options.optimizeLevel !== undefined) {
    flags.push("--optimizeLevel", options.optimizeLevel.toString());
  }

  if (options.shrinkLevel !== undefined) {
    flags.push("--shrinkLevel", options.shrinkLevel.toString());
  }

  if (options.features) {
    flags.push(...getFeaturesFlags(options.features));
  }

  if (options.converge) {
    flags.push("--converge");
  }

  if (options.noAssert) {
    flags.push("--noAssert");
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
