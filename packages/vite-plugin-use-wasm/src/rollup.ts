import { createRollupPlugin } from "unplugin";
import { useWasmBase } from ".";

const useWasm = createRollupPlugin(useWasmBase);
export default useWasm;
