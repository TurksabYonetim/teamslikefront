import { useCallback, useEffect, useRef, useState } from "react";

export interface DragState {
  /** Sürüklenen öğenin liste indeksi. */
  fromIndex: number;
  /** Sürüklenen öğenin anlık hedef indeksi. */
  toIndex: number;
  /** Sürüklenen kartın anlık dikey ofseti (px). */
  offsetY: number;
}

interface UseDragReorderArgs {
  /** Liste uzunluğu (yeniden ölçüm tetiklemek için). */
  count: number;
  /** Sürükleme bittiğinde from→to taşımayı uygula. */
  onCommit: (fromIndex: number, toIndex: number) => void;
}

interface UseDragReorderResult {
  drag: DragState | null;
  /** Tutamacın pointerdown'ında çağrılır. */
  start: (e: React.PointerEvent, index: number) => void;
  /** Verilen indeks için uygulanması gereken dikey kayma (px). */
  shiftFor: (index: number) => number;
  /** Konteyner ref'i (kart yüksekliklerini ölçmek için). */
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Tek sütunlu dikey listede pointer-capture ile sürükle-bırak yeniden sıralama.
 *
 * emil ilkeleri:
 * - Yalnızca `transform`/`opacity` animasyone edilir (layout reflow yok).
 * - Sürüklenen kart pointer'ı takip eder; diğer kartlar yer açmak için kayar.
 * - Hareket kısa ve --ease-out ile yumuşatılır; momentum yoktur.
 * - prefers-reduced-motion: kayma animasyonu CSS düzeyinde anında olur,
 *   sürükleme işlevi korunur (yalnızca geçiş süresi sıfırlanır).
 */
export function useDragReorder({
  count,
  onCommit,
}: UseDragReorderArgs): UseDragReorderResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Sürükleme süresince mutable bilgi (re-render tetiklemeden okunur).
  const meta = useRef<{
    pointerId: number;
    startClientY: number;
    fromIndex: number;
    centers: number[]; // her kartın dikey merkezi (viewport)
    target: HTMLElement | null;
  } | null>(null);

  // Sürükleme başında ölçülen kart adımı (yükseklik + boşluk); shiftFor kullanır.
  const stepRef = useRef(0);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return [] as number[];
    const cards = Array.from(
      el.querySelectorAll<HTMLElement>("[data-block-id]"),
    );
    const rects = cards.map((c) => c.getBoundingClientRect());
    // Ortalama adım: ardışık kart üstleri arası mesafe (boşluk dahil).
    if (rects.length >= 2) {
      let sum = 0;
      for (let i = 1; i < rects.length; i++) sum += rects[i].top - rects[i - 1].top;
      stepRef.current = sum / (rects.length - 1);
    } else if (rects.length === 1) {
      stepRef.current = rects[0].height + 16;
    }
    return rects.map((r) => r.top + r.height / 2);
  }, []);

  const start = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (count < 2) return;
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      const centers = measure();
      meta.current = {
        pointerId: e.pointerId,
        startClientY: e.clientY,
        fromIndex: index,
        centers,
        target,
      };
      setDrag({ fromIndex: index, toIndex: index, offsetY: 0 });
    },
    [count, measure],
  );

  useEffect(() => {
    if (!drag) return;

    function onMove(ev: PointerEvent) {
      const m = meta.current;
      if (!m || ev.pointerId !== m.pointerId) return;
      const offsetY = ev.clientY - m.startClientY;
      // Sürüklenen kartın anlık merkezi
      const draggedCenter = m.centers[m.fromIndex] + offsetY;
      // En yakın slot
      let toIndex = m.fromIndex;
      for (let i = 0; i < m.centers.length; i++) {
        if (i === m.fromIndex) continue;
        const c = m.centers[i];
        if (i < m.fromIndex && draggedCenter < c) {
          toIndex = Math.min(toIndex, i);
        } else if (i > m.fromIndex && draggedCenter > c) {
          toIndex = Math.max(toIndex, i);
        }
      }
      setDrag((prev) =>
        prev ? { ...prev, toIndex, offsetY } : prev,
      );
    }

    function finish(ev: PointerEvent) {
      const m = meta.current;
      if (!m || ev.pointerId !== m.pointerId) return;
      try {
        m.target?.releasePointerCapture(m.pointerId);
      } catch {
        /* capture zaten serbest olabilir */
      }
      setDrag((prev) => {
        if (prev && prev.fromIndex !== prev.toIndex) {
          onCommit(prev.fromIndex, prev.toIndex);
        }
        return null;
      });
      meta.current = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [drag, onCommit]);

  /**
   * Sürükleme sırasında her kartın açması gereken boşluğu hesaplar.
   * Sürüklenen kartın kendisi transform'u JS ile (offsetY) alır; o yüzden
   * burada 0 döner ve CanvasPage onu ayrı ele alır.
   */
  const shiftFor = useCallback(
    (index: number): number => {
      if (!drag) return 0;
      const { fromIndex, toIndex } = drag;
      if (index === fromIndex) return 0; // dragged item: offsetY ayrı uygulanır
      const step = stepRef.current;
      // Aşağı taşıma: aradaki kartlar yukarı kayar.
      if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
        return -step;
      }
      // Yukarı taşıma: aradaki kartlar aşağı kayar.
      if (fromIndex > toIndex && index < fromIndex && index >= toIndex) {
        return step;
      }
      return 0;
    },
    [drag],
  );

  // Liste değişirse aktif sürüklemeyi iptal et (güvenlik).
  useEffect(() => {
    setDrag(null);
    meta.current = null;
  }, [count]);

  return { drag, start, shiftFor, containerRef };
}
