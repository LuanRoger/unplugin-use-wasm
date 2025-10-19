import { sum } from "./sum";

export function callSum(a: number, b: number): number {
  return sum(a, b);
}

console.log(`Sum of 3 and 5 is: ${callSum(3, 5)}`);
