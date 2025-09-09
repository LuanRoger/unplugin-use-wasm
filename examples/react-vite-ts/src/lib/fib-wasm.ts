"use wasm";

export function fibWasm(n: i32): i32 {
  if (n <= 1) return n;
  return fibWasm(n - 1) + fibWasm(n - 2);
}
