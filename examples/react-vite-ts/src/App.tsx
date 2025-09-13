import { useState } from "react";
import { fibJs } from "./lib/fib-js";
import { fibWasm } from "./lib/fib-wasm";

function App() {
  const [wasmResult, setWasmResult] = useState<number | null>(null);
  const [wasmInputValue, setWasmInputValue] = useState<string>("");

  const [jsResult, setJsResult] = useState<number | null>(null);
  const [jsInputValue, setJsInputValue] = useState<string>("");

  const [jsTime, setJsTime] = useState<number | null>(null);
  const [wasmTime, setWasmTime] = useState<number | null>(null);

  function handleWasmSubmit(e: React.FormEvent) {
    e.preventDefault();

    const start = performance.now();

    const number = parseInt(wasmInputValue, 10);
    const result = fibWasm(number);

    const end = performance.now();
    setWasmTime(end - start);
    setWasmResult(result);
  }

  function handleJsSubmit(e: React.FormEvent) {
    e.preventDefault();

    const start = performance.now();

    const number = parseInt(jsInputValue, 10);
    const result = fibJs(number);

    const end = performance.now();
    setJsTime(end - start);
    setJsResult(result);
  }

  return (
    <main className="flex w-full h-screen items-center justify-center gap-4 bg-gray-800 text-white">
      <div className="flex flex-col gap-4 p-4 border border-purple-500 rounded-xl">
        <h2>Fibonacci WASM</h2>
        <form onSubmit={handleWasmSubmit} className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Enter a number"
            className="border border-gray-300 rounded px-2 py-1"
            onChange={(e) => setWasmInputValue(e.target.value)}
          />
          <button
            type="submit"
            className="bg-purple-500 text-white rounded px-2 py-1"
          >
            Calculate
          </button>
        </form>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 justify-between">
            <h3 className="font-bold">Result:</h3>
            <p>{wasmResult !== null ? wasmResult : "No result"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <h3 className="font-bold">Time:</h3>
            <p>{wasmTime !== null ? `${wasmTime} ms` : "No result"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 border border-yellow-500 rounded-xl">
        <h2>Fibonacci JS</h2>
        <form onSubmit={handleJsSubmit} className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Enter a number"
            className="border border-gray-300 rounded px-2 py-1"
            onChange={(e) => setJsInputValue(e.target.value)}
          />
          <button
            type="submit"
            className="bg-yellow-500 text-white rounded px-2 py-1"
          >
            Calculate
          </button>
        </form>
        <div>
          <div className="flex gap-2 justify-between">
            <h3 className="font-bold">Result:</h3>
            <p>{jsResult !== null ? jsResult : "No result"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <h3 className="font-bold">Time:</h3>
            <p>{jsTime !== null ? `${jsTime} ms` : "No result"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
