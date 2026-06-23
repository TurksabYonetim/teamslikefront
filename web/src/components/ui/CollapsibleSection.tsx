// web/src/components/ui/CollapsibleSection.tsx
import type { ReactNode } from "react";
import clsx from "clsx";
import { HiOutlineChevronDown } from "react-icons/hi2";

/**
 * Katlanır bölüm: başlık butonu + dönen (rotate-180) chevron + grid-rows-[1fr]/[0fr]
 * yükseklik animasyonu. `children` her zaman `overflow-hidden` kabı içinde render edilir
 * (kapalıyken 0 yükseklik). `aria-expanded`/`aria-controls` ile erişilebilir.
 *
 * Tetikleyici stili `triggerClassName` ile override edilebilir (varsayılan: builder
 * inset-kart başlığı). İçerik düzeni (grid/flex/padding) tamamen çağıranın sorumluluğunda
 * — `children` olarak verilir.
 */
const DEFAULT_TRIGGER =
  "flex w-full items-center justify-between gap-2 rounded-lg text-sm font-semibold text-brand transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function CollapsibleSection({
  open,
  onToggle,
  id,
  title,
  children,
  triggerClassName = DEFAULT_TRIGGER,
}: {
  open: boolean;
  onToggle: () => void;
  id: string;
  title: ReactNode;
  children: ReactNode;
  triggerClassName?: string;
}) {
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className={triggerClassName}>
        {title}
        <HiOutlineChevronDown
          size={16}
          aria-hidden
          className={clsx(
            "shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={id}
        className={clsx(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </>
  );
}
