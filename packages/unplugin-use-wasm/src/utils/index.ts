import path from "node:path";
import { ensureDir, pathExists, remove } from "fs-extra";
import { STANDALONE_ENVIRONMENT_FOLDER } from "../constants";

export class StandaloneEnvironment {
  private readonly standalonePath: string;

  public readonly standaloneOutputPath: string;
  public readonly standaloneOutputEntryPoint: string;

  constructor(cwd: string) {
    this.standalonePath = path.join(cwd, STANDALONE_ENVIRONMENT_FOLDER);
    this.standaloneOutputPath = path.join(this.standalonePath, "dist");
    this.standaloneOutputEntryPoint = path.join(
      this.standaloneOutputPath,
      "index.mjs",
    );
  }

  async setup() {
    const doesStandaloneEnvExist = await pathExists(this.standaloneOutputPath);
    if (!doesStandaloneEnvExist) {
      await ensureDir(this.standaloneOutputPath);
    }
  }

  async clean() {
    const doesStandaloneEnvExist = await pathExists(this.standalonePath);
    if (!doesStandaloneEnvExist) {
      return;
    }

    await remove(this.standalonePath);
  }
}
