import * as React from "react";
import clsx from "clsx";

interface DropdownProps {
  trigger: React.ReactNode;
  label: string;
  align?: "start" | "end";
  /** Menünün tetikleyiciye göre açılma yönü. Alta sabitlenmiş çubuklarda "top" kullan. */
  side?: "top" | "bottom";
  /** Menü genişliği (Tailwind sınıfı). İçeriğe göre genişlemesi gereken menülerde geçersiz kıl. */
  menuWidth?: string;
  triggerClassName?: string;
  children: React.ReactNode;
}

const Ctx = React.createContext<{ close: () => void } | null>(null);

export function Dropdown({ trigger, label, align = "end", side = "bottom", menuWidth = "w-48", triggerClassName, children }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx("transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]", triggerClassName)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className={clsx(
            "absolute z-50 rounded-md border border-line bg-surface p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800",
            menuWidth,
            // emil: tetikleyiciden ölçeklenerek aç (origin-aware), merkez değil
            side === "top" ? "bottom-full mb-1" : "top-full mt-1",
            align === "end"
              ? side === "top"
                ? "end-0 origin-bottom-right"
                : "end-0 origin-top-right"
              : side === "top"
                ? "start-0 origin-bottom-left"
                : "start-0 origin-top-left",
            "motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]",
          )}
        >
          <Ctx.Provider value={{ close: () => setOpen(false) }}>{children}</Ctx.Provider>
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ onSelect, children }: { onSelect: () => void; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect();
        ctx?.close();
      }}
      className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-start text-sm text-ink outline-none transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-1 focus-visible:ring-blue-500 dark:text-white dark:hover:bg-gray-700"
    >
      {children}
    </button>
  );
}
