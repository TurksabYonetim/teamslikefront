import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Backend ucu olmayan feature'lar için localStorage tabanlı genel CRUD store'u.
 *
 * Aynı anahtarı kullanan tüm bileşenler senkron kalır (aynı sekmede subscriber
 * seti, sekmeler arası `storage` event'i ile). Veriler JSON dizi olarak saklanır.
 *
 * Kullanım:
 *   const { items, create, update, remove, replaceAll } = useLocalCrud<Task>(
 *     "tasks", initialSeed,
 *   );
 *
 * - `create(partial)`  → id üretir, başa/sona ekler, eklenen kaydı döner
 * - `update(id, patch)`→ ilgili kaydı kısmi günceller
 * - `remove(id)`       → kaydı siler
 * - `replaceAll(next)` → tüm listeyi değiştirir (sürükle-bırak sıralaması vb.)
 *
 * `seed` yalnızca anahtar localStorage'da HİÇ yoksa bir kez yazılır; böylece
 * kullanıcının yaptığı CRUD değişiklikleri sayfa yenilense de korunur.
 */

export interface WithId {
  id: string;
}

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const memoryCache = new Map<string, string>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function readRaw(key: string): string | null {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string) {
  memoryCache.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* kota dolu / private mode — bellek cache yine de geçerli */
  }
  emit(key);
}

function subscribe(key: string, listener: Listener): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);

  // Sekmeler arası senkron
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      memoryCache.delete(key);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set!.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fallback */
  }
  return `id-${Math.random().toString(36).slice(2)}-${performance.now().toString(36)}`;
}

export interface LocalCrud<T extends WithId> {
  items: T[];
  create: (partial: Omit<T, "id"> & Partial<WithId>, opts?: { prepend?: boolean }) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  replaceAll: (next: T[]) => void;
  clear: () => void;
}

export function useLocalCrud<T extends WithId>(
  storageKey: string,
  seed: T[] = [],
): LocalCrud<T> {
  const key = `tl_crud_${storageKey}`;

  const getSnapshot = useCallback((): string => {
    const raw = readRaw(key);
    if (raw == null) {
      const seeded = JSON.stringify(seed);
      writeRaw(key, seeded);
      return seeded;
    }
    return raw;
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const getServerSnapshot = useCallback(() => JSON.stringify(seed), []); // eslint-disable-line react-hooks/exhaustive-deps

  const raw = useSyncExternalStore(
    (l) => subscribe(key, l),
    getSnapshot,
    getServerSnapshot,
  );

  const items = useMemo<T[]>(() => {
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }, [raw]);

  const create = useCallback<LocalCrud<T>["create"]>(
    (partial, opts) => {
      const item = { id: partial.id ?? uid(), ...partial } as T;
      const current: T[] = JSON.parse(readRaw(key) ?? "[]");
      const next = opts?.prepend ? [item, ...current] : [...current, item];
      writeRaw(key, JSON.stringify(next));
      return item;
    },
    [key],
  );

  const update = useCallback<LocalCrud<T>["update"]>(
    (id, patch) => {
      const current: T[] = JSON.parse(readRaw(key) ?? "[]");
      const next = current.map((it) => (it.id === id ? { ...it, ...patch } : it));
      writeRaw(key, JSON.stringify(next));
    },
    [key],
  );

  const remove = useCallback<LocalCrud<T>["remove"]>(
    (id) => {
      const current: T[] = JSON.parse(readRaw(key) ?? "[]");
      writeRaw(key, JSON.stringify(current.filter((it) => it.id !== id)));
    },
    [key],
  );

  const replaceAll = useCallback<LocalCrud<T>["replaceAll"]>(
    (next) => writeRaw(key, JSON.stringify(next)),
    [key],
  );

  const clear = useCallback(() => writeRaw(key, "[]"), [key]);

  return { items, create, update, remove, replaceAll, clear };
}
