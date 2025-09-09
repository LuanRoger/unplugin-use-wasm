import "./styles/global.css";
import { useState } from "react";
import { add } from "./lib/add";

function App() {
  const inputClass = "border border-gray-300 rounded px-4 py-2";

  const [result, setResult] = useState<number | null>(null);
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const num1 = parseInt(input1);
    const num2 = parseInt(input2);

    if (!isNaN(num1) && !isNaN(num2)) {
      const sum = add(num1, num2);
      setResult(sum);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center justify-center"
      >
        <div className="flex gap-4 items-center justify-center">
          <input
            type="text"
            className={inputClass}
            placeholder="Type an number..."
            onChange={(e) => setInput1(e.target.value)}
          />
          <span className="font-bold text-lg">+</span>
          <input
            type="text"
            className={inputClass}
            placeholder="Type an number..."
            onChange={(e) => setInput2(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white rounded px-4 py-2"
        >
          Add
        </button>
      </form>
      <p className="text-xl font-bold">
        {result !== null ? result : "No result"}
      </p>
    </div>
  );
}

export default App;
