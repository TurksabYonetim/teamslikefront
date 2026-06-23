// web/src/lib/storeArray.ts
/**
 * `id`'li varlık dizileri için değişmez (immutable) güncelleme yardımcıları.
 * Store action'larında tekrar eden `arr.map((x) => (x.id === id ? … : x))`
 * kalıbının tek kaynağı. Davranış birebir aynıdır — yeni dizi döner, eşleşme
 * yoksa orijinal öğeler korunur.
 */
export interface HasId {
  id: string;
}

/** `id` eşleşen öğeyi `fn` ile değiştirir; diğerleri aynı kalır. */
export function updateById<T extends HasId>(arr: T[], id: string, fn: (item: T) => T): T[] {
  return arr.map((item) => (item.id === id ? fn(item) : item));
}

/** `id` eşleşen öğeyi diziden çıkarır. */
export function removeById<T extends HasId>(arr: T[], id: string): T[] {
  return arr.filter((item) => item.id !== id);
}

/** İlkel değer dizisinde: varsa çıkarır, yoksa sona ekler. */
export function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

/** Öğeyi yalnızca aynı `id`'li bir öğe yoksa sona ekler. */
export function appendUnique<T extends HasId>(arr: T[], item: T): T[] {
  return arr.some((x) => x.id === item.id) ? arr : [...arr, item];
}
