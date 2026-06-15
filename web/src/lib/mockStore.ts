/**
 * Backend olmadan (frontend-only) çalışmak için localStorage tabanlı sahte
 * CRUD deposu. Gerçek `/v1/...` endpoint'leri staging'de henüz yok (404), bu
 * yüzden veri modülleri (tasks / clips / docs) bu depo üzerinden persist edilir.
 *
 * Her API dosyası `createMockStore` ile aynı list/create/update/remove imzasını
 * korur → React Query hook'ları ve component'ler hiç değişmeden çalışır.
 */

const PREFIX = "tl_mock_";

/** Sahte ağ gecikmesi (ms) — yükleme skeleton'ı ve optimistic akış doğal görünsün. */
const LATENCY_MS = 120;

export interface MockEntity {
  id: string;
  created_at: string;
}

/** RFC4122 id; crypto.randomUUID yoksa zaman + rastgele fallback. */
export function mockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

/** Şu anın ISO datetime değeri. */
export function nowIso(): string {
  return new Date().toISOString();
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

interface StoreOptions<T extends MockEntity, C, U> {
  /** localStorage anahtarı (PREFIX otomatik eklenir). */
  key: string;
  /** İlk açılışta (kayıt yoksa) yazılacak başlangıç verisi. */
  seed: () => T[];
  /** create body → tam kayıt (id/created_at burada üretilir). */
  build: (body: C, existing: T[]) => T;
  /** update body → güncellenmiş kayıt. */
  merge: (current: T, body: U) => T;
}

export interface MockStore<T, C, U> {
  list: () => Promise<T[]>;
  create: (body: C) => Promise<T>;
  update: (id: string, body: U) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function createMockStore<T extends MockEntity, C, U>(
  opts: StoreOptions<T, C, U>,
): MockStore<T, C, U> {
  const storageKey = PREFIX + opts.key;

  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw == null) {
        const seeded = opts.seed();
        localStorage.setItem(storageKey, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  };

  const write = (items: T[]): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      /* kota / private mode → sessiz geç */
    }
  };

  return {
    list: () => delay(read()),

    create: (body: C) => {
      const items = read();
      const created = opts.build(body, items);
      write([...items, created]);
      return delay(created);
    },

    update: (id: string, body: U) => {
      const items = read();
      const idx = items.findIndex((it) => it.id === id);
      if (idx === -1) {
        return Promise.reject(new Error(`Kayıt bulunamadı: ${id}`));
      }
      const updated = opts.merge(items[idx], body);
      const next = [...items];
      next[idx] = updated;
      write(next);
      return delay(updated);
    },

    remove: (id: string) => {
      const items = read();
      write(items.filter((it) => it.id !== id));
      return delay(undefined);
    },
  };
}
