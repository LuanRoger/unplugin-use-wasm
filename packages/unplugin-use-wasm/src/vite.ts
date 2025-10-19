import { createVitePlugin } from "unplugin";
import { useWasmBase } from ".";

const useWasm = createVitePlugin(useWasmBase);
export default useWasm;
