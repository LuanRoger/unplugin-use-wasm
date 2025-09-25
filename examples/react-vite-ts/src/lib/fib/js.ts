export function fibJs(n: number): number {
  if (n <= 1) return n;
  return fibJs(n - 1) + fibJs(n - 2);
}
