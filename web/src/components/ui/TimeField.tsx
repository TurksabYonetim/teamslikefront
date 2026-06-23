import * as React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { usePopover } from "./usePopover";
import { CONTROL_HEIGHT } from "./controlSize";

/**
 * Özel, marka-tutarlı zaman seçici (HH:MM).
 *
 * Neden native `<input type="time">` değil: tarayıcının açılan listesi (saat/dakika
 * sütunları) stillenemez ve OS'a göre farklı görünür. Bu bileşen `Select` ile aynı
 * dili konuşur: tetikleyici + portal'lı panel, `border-line`/`bg-surface`, marka
 * mavisi seçim, `tl-pop-in` açılış. İki sütun (saat / dakika) tek panelde.
 */

interface TimeFieldProps {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
  /** Dakika adımı (vars. 5). */
  minuteStep?: number;
  disabled?: boolean;
  "aria-label"?: string;
  /** Tetikleyiciye ek sınıf (genişlik vb.). */
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const ClockIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TimeField({
  value,
  onChange,
  minuteStep = 5,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const hourColRef = React.useRef<HTMLDivElement | null>(null);
  const minuteColRef = React.useRef<HTMLDivElement | null>(null);

  const [hStr = "09", mStr = "00"] = (value || "09:00").split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = React.useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep],
  );

  const PANEL_W = 168; // px — iki sütun + boşluk

  const coords = usePopover({ open, onClose: () => setOpen(false), triggerRef, panelRef, panelW: PANEL_W, panelH: 248 });

  // Açılınca seçili saat/dakikayı görünür alana kaydır.
  React.useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      hourColRef.current?.querySelector<HTMLElement>("[data-selected='true']")?.scrollIntoView?.({ block: "center" });
      minuteColRef.current
        ?.querySelector<HTMLElement>("[data-selected='true']")
        ?.scrollIntoView?.({ block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const pickHour = (h: number) => onChange(`${pad(h)}:${pad(minute)}`);
  const pickMinute = (m: number) => {
    onChange(`${pad(hour)}:${pad(m)}`);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const cellCls = (selected: boolean) =>
    clsx(
      // 40px dokunma hedefi (mobil) — wheel hissini korur ama parmakla rahat seçilir.
      "flex h-10 cursor-pointer select-none items-center justify-center rounded-md text-sm font-medium tabular-nums outline-none transition-colors",
      selected
        ? "bg-brand text-white"
        : "text-ink hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-1 focus-visible:ring-blue-500",
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={clsx(
          `inline-flex ${CONTROL_HEIGHT} items-center justify-between gap-1.5 rounded-lg border bg-surface px-2.5 text-sm tabular-nums text-ink`,
          "transition-[transform,border-color,box-shadow] duration-[var(--dur-press)] ease-[var(--ease-out)]",
          "motion-safe:active:scale-[0.99] focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
          open ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-40",
          className,
        )}
      >
        <span>{`${pad(hour)}:${pad(minute)}`}</span>
        {ClockIcon}
      </button>

      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              style={{
                position: "fixed",
                left: coords.left,
                top: coords.placement === "bottom" ? coords.top : undefined,
                bottom: coords.placement === "top" ? window.innerHeight - coords.top : undefined,
                width: PANEL_W,
              }}
              className={clsx(
                "z-[80] flex gap-1 rounded-lg border border-line bg-surface p-1.5 shadow-xl",
                coords.placement === "bottom" ? "origin-top" : "origin-bottom",
                "motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]",
              )}
            >
              <div
                ref={hourColRef}
                role="listbox"
                aria-label="Saat"
                className="grid max-h-56 flex-1 auto-rows-max grid-cols-1 gap-0.5 overflow-y-auto overscroll-contain pe-0.5"
              >
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={h === hour}
                    data-selected={h === hour}
                    onClick={() => pickHour(h)}
                    className={cellCls(h === hour)}
                  >
                    {pad(h)}
                  </button>
                ))}
              </div>
              <div className="w-px shrink-0 bg-line" aria-hidden="true" />
              <div
                ref={minuteColRef}
                role="listbox"
                aria-label="Dakika"
                className="grid max-h-56 flex-1 auto-rows-max grid-cols-1 gap-0.5 overflow-y-auto overscroll-contain ps-0.5"
              >
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="option"
                    aria-selected={m === minute}
                    data-selected={m === minute}
                    onClick={() => pickMinute(m)}
                    className={cellCls(m === minute)}
                  >
                    {pad(m)}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
