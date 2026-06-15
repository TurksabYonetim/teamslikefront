import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ApiUser } from "./users.api";

/**
 * Backend'de UPDATE/DELETE ucu YOK. Bu yüzden "düzenle / sil / pasifleştir"
 * işlemlerini sunucu listesinin ÜZERİNE bindirilen, localStorage tabanlı bir
 * "overlay" (örtü) katmanı ile çözüyoruz.
 *
 * - Kaynak doğruluk (source of truth) yine GET /v1/users/ listesidir.
 * - Overlay, id → kısmi yama (patch) eşlemesi tutar:
 *     { [userId]: { full_name?, role?, is_active?, _deleted? } }
 * - `applyOverlay()` API listesini overlay ile birleştirip silinenleri eler.
 *
 * Böylece sayfa yenilense de yerel düzenlemeler korunur; backend gerçek
 * uçları eklediğinde bu katman kaldırılıp mutation'lar API'ye bağlanabilir.
 */

export interface UserOverlayPatch {
  full_name?: string;
  role?: string;
  is_active?: boolean;
  _deleted?: boolean;
}

type OverlayMap = Record<string, UserOverlayPatch>;

const STORAGE_KEY = "tl_users_overlay";

const listeners = new Set<() => void>();
let memoryCache: string | null = null;

function readRaw(): string {
  if (memoryCache != null) return memoryCache;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function writeRaw(value: string) {
  memoryCache = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* kota dolu / private mode — bellek cache geçerli kalır */
  }
  listeners.forEach((l) => l());
}

function parse(raw: string): OverlayMap {
  try {
    return JSON.parse(raw) as OverlayMap;
  } catch {
    return {};
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memoryCache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Sunucu listesine overlay yamalarını uygular, silinmişleri eler. */
export function applyOverlay(users: ApiUser[], overlay: OverlayMap): ApiUser[] {
  return users
    .filter((u) => !overlay[u.id]?._deleted)
    .map((u) => {
      const patch = overlay[u.id];
      if (!patch) return u;
      const { _deleted, ...fields } = patch;
      void _deleted;
      return { ...u, ...fields };
    });
}

/** Overlay store'una reaktif erişim + mutasyon yardımcıları. */
export function useUsersOverlay() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  const overlay = useMemo(() => parse(raw), [raw]);

  const patch = useCallback((id: string, p: UserOverlayPatch) => {
    const current = parse(readRaw());
    const next = { ...current, [id]: { ...current[id], ...p } };
    writeRaw(JSON.stringify(next));
  }, []);

  const update = useCallback(
    (id: string, fields: Pick<UserOverlayPatch, "full_name" | "role">) =>
      patch(id, fields),
    [patch],
  );

  const setActive = useCallback(
    (id: string, is_active: boolean) => patch(id, { is_active }),
    [patch],
  );

  const remove = useCallback((id: string) => patch(id, { _deleted: true }), [patch]);

  return { overlay, update, setActive, remove };
}
