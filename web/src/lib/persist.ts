// web/src/lib/persist.ts
/**
 * localStorage JSON kalıcılığı için tek kaynak. SSR guard + try/catch'i (kota
 * dolu / private mode / parse hatası) tek yerde toplar; store'lar yalnızca
 * birleştirme (merge) mantığını taşır. Önceki dağınık `load()`/`persist()`
 * yardımcılarının davranışını korur: erişilemez/bozuk durumda fallback döner,
 * yazım hatası sessizce yoksayılır.
 */

/** Anahtardan JSON oku; yoksa/bozuksa/SSR'de `fallback` döner. */
export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Değeri JSON olarak yaz; SSR'de atlanır, hata (kota/private mode) sessizce yoksayılır. */
export function saveJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kota dolu / private mode — sessizce yoksay */
  }
}
