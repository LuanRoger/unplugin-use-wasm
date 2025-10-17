import { createRolldownPlugin } from "unplugin";
import { useWasmBase } from ".";

const useWasm = createRolldownPlugin(useWasmBase);
export default useWasm;
