import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import clsx from "clsx";

interface ToastAction {
  label: string;
  onClick: () => void;
}
interface ToastInput {
  message: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  action?: ToastAction;
}
interface ToastItem extends ToastInput {
  id: number;
  /** Çıkış animasyonu oynarken true; bittiğinde DOM'dan kaldırılır. */
  leaving?: boolean;
}

/* ---- Sonner deck parametreleri ---- */
/** Çıkış animasyonu süresi — --dur-toast (400ms) ile uyumlu olmalı. */
const EXIT_MS = 400;
/** Aynı anda tam görünür (etkileşilebilir) toast sayısı. */
const MAX_VISIBLE = 3;
/** Açık (hover) durumda kartlar arası dikey boşluk. */
const GAP = 14;
/** Kapalı destede arka kartların yukarı doğru "göz kırpma" payı. */
const COLLAPSE_PEEK = 16;
/** Kapalı destede her arka kartın küçülme adımı. */
const SCALE_STEP = 0.06;
/** Swipe ile kapatma eşiği (px). */
const SWIPE_THRESHOLD = 45;
/** Hızlı flick eşiği (px/ms) — mesafeden bağımsız kapatır. */
const VELOCITY_THRESHOLD = 0.11;

interface ToastApi {
  show: (t: ToastInput) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState(false);
  const seq = useRef(0);

  /** Süre takibi: her toast için kalan ömür ve aktif zamanlayıcı. */
  const timers = useRef<Record<number, number>>({});
  const remaining = useRef<Record<number, number>>({});
  const resumedAt = useRef<Record<number, number>>({});

  /** Çıkış animasyonunu tetikle, bitince DOM'dan kaldır. */
  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current[id]);
    delete timers.current[id];
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
      setHeights((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      delete remaining.current[id];
      delete resumedAt.current[id];
    }, EXIT_MS);
  }, []);

  /** Bir toast'un ömür sayacını başlat/sürdür. */
  const resume = useCallback(
    (id: number) => {
      const ms = remaining.current[id];
      if (ms == null) return;
      resumedAt.current[id] = Date.now();
      window.clearTimeout(timers.current[id]);
      timers.current[id] = window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  /** Tüm sayaçları duraklat ve kalan süreyi sakla. */
  const pauseAll = useCallback(() => {
    const now = Date.now();
    for (const idStr of Object.keys(timers.current)) {
      const id = Number(idStr);
      window.clearTimeout(timers.current[id]);
      const elapsed = now - (resumedAt.current[id] ?? now);
      remaining.current[id] = Math.max(0, (remaining.current[id] ?? 0) - elapsed);
    }
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = ++seq.current;
      setItems((prev) => [...prev, { ...t, id }]);
      const ms = t.duration ?? 4000;
      remaining.current[id] = ms;
      // Deste açıkken (hover) yeni gelen toast da beklemeli.
      if (!expanded) resume(id);
    },
    [expanded, resume],
  );

  // Hover ile aç/kapa: açıkken sayaçlar durur, kapanınca kalan süreyle devam.
  useEffect(() => {
    if (expanded) {
      pauseAll();
    } else {
      for (const t of items) if (!t.leaving) resume(t.id);
    }
    // items bağımlılığı kasıtlı dışarıda: yalnız expanded geçişinde çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Yeni eklenen toast'lar için (kapalıyken) sayaç başlat.
  useEffect(() => {
    if (expanded) return;
    for (const t of items) {
      if (!t.leaving && timers.current[t.id] == null && remaining.current[t.id] != null) {
        resume(t.id);
      }
    }
  }, [items, expanded, resume]);

  // Sekme gizlenince tüm sayaçları duraklat (Sonner kenar durumu).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseAll();
      else if (!expanded) for (const t of items) if (!t.leaving) resume(t.id);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [items, expanded, pauseAll, resume]);

  const onHeight = useCallback((id: number, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  const L = items.length;
  const frontId = L ? items[L - 1].id : undefined;
  const frontHeight = frontId != null ? heights[frontId] ?? 0 : 0;

  // Her toast için kendisinden daha yeni (önündeki) toast'ların toplam yüksekliği.
  const heightsAfter = useMemo(() => {
    const arr = new Array<number>(L);
    let running = 0;
    for (let i = L - 1; i >= 0; i--) {
      arr[i] = running;
      running += heights[items[i].id] ?? frontHeight;
    }
    return arr;
  }, [items, heights, frontHeight, L]);

  // Konteyner yüksekliği: kapalıyken ön kart, açıkken görünür kartların toplamı.
  const containerHeight = useMemo(() => {
    if (!L) return 0;
    if (!expanded) return frontHeight;
    let total = 0;
    let count = 0;
    for (let i = L - 1; i >= 0 && count < MAX_VISIBLE; i--, count++) {
      total += heights[items[i].id] ?? frontHeight;
    }
    return total + GAP * Math.max(0, count - 1);
  }, [L, expanded, frontHeight, heights, items]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {L > 0 && (
        <section
          aria-label="Bildirimler"
          className="fixed bottom-4 right-4 z-[100] w-[min(380px,calc(100vw-2rem))]"
          style={{
            height: containerHeight,
            transition: "height var(--dur-toast) var(--ease-toast)",
          }}
          onPointerEnter={() => setExpanded(true)}
          onPointerLeave={() => setExpanded(false)}
        >
          <ol role="region" aria-live="polite" className="list-none">
            {items.map((t, i) => {
              const before = L - 1 - i; // 0 = ön (en yeni)
              return (
                <ToastRow
                  key={t.id}
                  item={t}
                  before={before}
                  hidden={before >= MAX_VISIBLE}
                  expanded={expanded}
                  zIndex={i + 1}
                  ownHeight={heights[t.id] ?? frontHeight}
                  frontHeight={frontHeight}
                  heightsAfter={heightsAfter[i]}
                  onHeight={onHeight}
                  onDismiss={dismiss}
                />
              );
            })}
          </ol>
        </section>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Tek toast kartı. emil / Sonner prensipleri:
 * - Kartlar alttan gelir; üst üste yığılır (deck), hover'da liste olarak açılır.
 * - Kapalıyken arka kartlar küçülür + yukarı göz kırpar + ön kart yüksekliğine
 *   kısılır (yeknesak deste); açılınca kendi doğal yüksekliğine genişler.
 * - Geçişler keyframe değil, kesintiye uğrayabilen CSS transition; `ease` ile
 *   biraz yavaş (--dur-toast) — Sonner kohezyonu.
 * - Aşağı sürükleyerek (swipe) kapatma; mesafe veya hız eşiği.
 */
function ToastRow({
  item,
  before,
  hidden,
  expanded,
  zIndex,
  ownHeight,
  frontHeight,
  heightsAfter,
  onHeight,
  onDismiss,
}: {
  item: ToastItem;
  before: number;
  hidden: boolean;
  expanded: boolean;
  zIndex: number;
  ownHeight: number;
  frontHeight: number;
  heightsAfter: number;
  onHeight: (id: number, h: number) => void;
  onDismiss: (id: number) => void;
}) {
  const [entered, setEntered] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number; t: number } | null>(null);

  // Mount sonrası giriş animasyonunu tetikle.
  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Doğal yüksekliği ölç (kapalıyken dış yükseklik kısıtlandığından iç ölçülür).
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    onHeight(item.id, el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => onHeight(item.id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, onHeight]);

  const dragging = drag != null;
  const off = !entered || item.leaving;

  // Deste konumu (alta sabit; transform-origin: bottom).
  const baseY = expanded
    ? -(heightsAfter + GAP * before)
    : -(before * COLLAPSE_PEEK);
  const scale = expanded ? 1 : Math.max(1 - before * SCALE_STEP, 0.82);

  let transform: string;
  let opacity: number;
  if (off) {
    // Giriş/çıkış: kendi yüksekliği kadar aşağıda, saydam.
    transform = "translateY(100%) scale(1)";
    opacity = 0;
  } else if (dragging) {
    transform = `translateY(${baseY + Math.max(0, drag!)}px) scale(${scale})`;
    opacity = Math.max(0, 1 - Math.max(0, drag!) / 120);
  } else {
    transform = `translateY(${baseY}px) scale(${scale})`;
    opacity = hidden ? 0 : 1;
  }

  const style: CSSProperties = {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "100%",
    zIndex,
    transform,
    transformOrigin: "bottom center",
    opacity,
    height: expanded ? ownHeight || undefined : frontHeight || undefined,
    transition: dragging
      ? "none"
      : "transform var(--dur-toast) var(--ease-toast), opacity var(--dur-toast) var(--ease-toast), height var(--dur-toast) var(--ease-toast)",
    pointerEvents: hidden ? "none" : "auto",
    touchAction: "none",
  };

  function onPointerDown(e: ReactPointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, t: Date.now() };
    setDrag(0);
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!dragStart.current) return;
    setDrag(e.clientY - dragStart.current.y);
  }
  function onPointerUp(e: ReactPointerEvent) {
    if (!dragStart.current) return;
    const dy = e.clientY - dragStart.current.y;
    const dt = Date.now() - dragStart.current.t;
    const velocity = Math.abs(dy) / Math.max(1, dt);
    dragStart.current = null;
    setDrag(null);
    if (dy > SWIPE_THRESHOLD || (dy > 8 && velocity > VELOCITY_THRESHOLD)) {
      onDismiss(item.id);
    }
  }

  return (
    <li
      data-state={off ? "closed" : "open"}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={innerRef}
        role={item.variant === "error" ? "alert" : "status"}
        className={clsx(
          "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
          "border-line bg-surface text-ink",
          "select-none",
        )}
      >
        <span
          aria-hidden
          className={clsx(
            "h-2 w-2 shrink-0 rounded-full",
            item.variant === "success" && "bg-ok",
            item.variant === "error" && "bg-danger",
            item.variant === "warning" && "bg-warn",
            (!item.variant || item.variant === "default") && "bg-brand",
          )}
        />
        <span className="min-w-0 flex-1">{item.message}</span>
        {item.action && (
          <button
            type="button"
            className="shrink-0 rounded font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            onClick={() => {
              item.action!.onClick();
              onDismiss(item.id);
            }}
          >
            {item.action.label}
          </button>
        )}
      </div>
    </li>
  );
}
