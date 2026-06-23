// web/src/components/ui/usePopover.ts
import * as React from "react";

export interface PopoverCoords {
  left: number;
  top: number;
  placement: "top" | "bottom";
}

/**
 * Tetikleyiciye sabitlenen (position:fixed + portal) panel mekaniği — DateField ve
 * TimeField'in birebir paylaştığı kısım:
 *  - `getBoundingClientRect` ile konum + yukarı/aşağı yerleşim (panelH'e göre seçilir,
 *    aşağıda yer yoksa ve yukarıda daha çoksa "top"),
 *  - `scroll`(capture) + `resize` ile yeniden konumlama,
 *  - dış tıklama (`pointerdown` capture) ile kapatma; `Escape` ile kapatıp tetikleyiciye odak.
 *
 * Panel boyutları sabit (`panelW`/`panelH`) varsayılır. Dinamik genişlikli listeler
 * (Select) farklı yatay hizalama mantığı kullandığından bunu KULLANMAZ.
 */
export function usePopover({
  open,
  onClose,
  triggerRef,
  panelRef,
  panelW,
  panelH,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  panelRef: React.RefObject<HTMLElement | null>;
  panelW: number;
  panelH: number;
}): PopoverCoords | null {
  const [coords, setCoords] = React.useState<PopoverCoords | null>(null);

  const computeCoords = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - r.bottom - margin;
    const placement: "top" | "bottom" =
      spaceBelow < panelH && r.top - margin > spaceBelow ? "top" : "bottom";
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - panelW - margin));
    setCoords({ left, top: placement === "bottom" ? r.bottom + 4 : r.top - 4, placement });
  }, [triggerRef, panelW, panelH]);

  React.useLayoutEffect(() => {
    if (!open) return;
    computeCoords();
    const onScroll = () => computeCoords();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", computeCoords);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", computeCoords);
    };
  }, [open, computeCoords]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return coords;
}
