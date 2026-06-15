import * as React from "react";
import clsx from "clsx";

interface DropdownProps {
  trigger: React.ReactNode;
  label: string;
  align?: "start" | "end";
  triggerClassName?: string;
  children: React.ReactNode;
}

const Ctx = React.createContext<{ close: () => void } | null>(null);

export function Dropdown({ trigger, label, align = "end", triggerClassName, children }: DropdownProps) {
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
            "absolute z-50 mt-1 w-48 rounded-md border border-line bg-surface p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800",
            // emil: tetikleyiciden ölçeklenerek aç (origin-aware), merkez değil
            align === "end" ? "end-0 origin-top-right" : "start-0 origin-top-left",
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
