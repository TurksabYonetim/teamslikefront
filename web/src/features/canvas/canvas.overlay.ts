import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Backend sözleşmesinde blok-düzeyi "pin" ve doküman-düzeyi "başlık" alanı YOK.
 * Bu yüzden bu iki yalnızca-UI durumunu, sunucu listesinin üzerine bindirilen
 * localStorage tabanlı bir "overlay" katmanında tutuyoruz (users.overlay ile
 * aynı desen). Kaynak doğruluk yine GET /v1/canvas/blocks'tur; overlay sayfa
 * yenilense de yerel pin/başlık tercihlerini korur.
 */

interface CanvasOverlay {
  /** Doküman (pano) başlığı — kullanıcı tarafından yeniden adlandırılabilir. */
  docTitle?: string;
  /** Sabitlenen blok id'leri kümesi. */
  pinned?: string[];
}

const STORAGE_KEY = "tl_canvas_overlay";

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

function parse(raw: string): CanvasOverlay {
  try {
    const o = JSON.parse(raw) as CanvasOverlay;
    return o && typeof o === "object" ? o : {};
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

/** Overlay store'una reaktif erişim + pin/başlık mutasyonları. */
export function useCanvasOverlay() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  const overlay = useMemo(() => parse(raw), [raw]);

  const pinnedSet = useMemo(
    () => new Set(overlay.pinned ?? []),
    [overlay.pinned],
  );

  const setDocTitle = useCallback((title: string) => {
    const current = parse(readRaw());
    writeRaw(JSON.stringify({ ...current, docTitle: title }));
  }, []);

  const togglePin = useCallback((id: string) => {
    const current = parse(readRaw());
    const set = new Set(current.pinned ?? []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    writeRaw(JSON.stringify({ ...current, pinned: [...set] }));
  }, []);

  const isPinned = useCallback((id: string) => pinnedSet.has(id), [pinnedSet]);

  return { docTitle: overlay.docTitle, setDocTitle, isPinned, togglePin, pinnedSet };
}
