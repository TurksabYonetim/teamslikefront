/** Dizinin son `n` elemanını döndürür (taşarsa baştan kırpar). */
export function capArray<T>(arr: T[], n: number): T[] {
  return arr.length > n ? arr.slice(arr.length - n) : arr;
}
