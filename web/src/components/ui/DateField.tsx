import * as React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

/**
 * Özel, marka-tutarlı tarih seçici (Flowbite datepicker görünümünde).
 *
 * Neden native `<input type="date">` değil: tarayıcının açılan takvimi stillenemez,
 * OS'a göre farklı görünür ve modal içinde tutarsızdır. Bu bileşen `Select`/`TimeField`
 * ile aynı dili konuşur: tetikleyici + portal'lı (fixed) panel → modal `overflow`'undan
 * kaçar, 320px'te bile çalışır. Ay ızgarası + prev/next + Bugün/Temizle aksiyonları.
 *
 * Değer biçimi: `value`/`onChange` her zaman ISO tarih `YYYY-MM-DD` (boş = "").
 *
 * Erişilebilirlik (WCAG 2.2 AAA hedefi): `role="dialog"` panel, gün hücreleri
 * `aria-pressed`/`aria-current`, ↑/↓/←/→ ile gün gezinme, Home/End, PageUp/PageDown
 * ile ay, Enter/Space ile seçim, Esc ile kapatma; 40px dokunma hedefi.
 */

interface DateFieldProps {
  value: string; // "YYYY-MM-DD" | ""
  onChange: (v: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  /** Tetikleyiciye ek sınıf (genişlik vb.). */
  className?: string;
}

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const WEEKDAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const fmtDisplay = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
};
/** Mon-first index (0=Mon … 6=Sun) of a JS day (0=Sun). */
const monFirst = (jsDay: number) => (jsDay + 6) % 7;

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3">
    <path
      d="M4 10h16M8 7V4m8 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function DateField({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = "gg.aa.yyyy",
  "aria-label": ariaLabel,
  className,
}: DateFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ left: number; top: number; placement: "top" | "bottom" } | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  const today = React.useMemo(() => new Date(), []);
  const parsed = React.useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m ? { y: +m[1], mo: +m[2] - 1, d: +m[3] } : null;
  }, [value]);

  // Görünen ay (yıl, 0-index ay) — seçili değer ya da bugün.
  const [view, setView] = React.useState(() =>
    parsed ? { y: parsed.y, mo: parsed.mo } : { y: today.getFullYear(), mo: today.getMonth() },
  );

  // Açılışta görünen ayı seçili değere/bugüne sabitle.
  React.useEffect(() => {
    if (open) setView(parsed ? { y: parsed.y, mo: parsed.mo } : { y: today.getFullYear(), mo: today.getMonth() });
  }, [open, parsed, today]);

  const PANEL_W = 296;
  const PANEL_H = 340;

  const computeCoords = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - r.bottom - margin;
    const placement: "top" | "bottom" = spaceBelow < PANEL_H && r.top - margin > spaceBelow ? "top" : "bottom";
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - PANEL_W - margin));
    setCoords({ left, top: placement === "bottom" ? r.bottom + 4 : r.top - 4, placement });
  }, []);

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
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Açılınca seçili/bugün hücresine odaklan.
  React.useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>("[data-focus='true']")?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const firstDow = monFirst(new Date(view.y, view.mo, 1).getDay());
  const daysInMonth = new Date(view.y, view.mo + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) =>
    d === today.getDate() && view.mo === today.getMonth() && view.y === today.getFullYear();
  const isSelected = (d: number) => !!parsed && parsed.y === view.y && parsed.mo === view.mo && parsed.d === d;

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const next = new Date(v.y, v.mo + delta, 1);
      return { y: next.getFullYear(), mo: next.getMonth() };
    });
  };

  const pick = (d: number) => {
    onChange(iso(view.y, view.mo, d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Izgara klavye gezinmesi.
  const onGridKey = (e: React.KeyboardEvent, d: number) => {
    const move = (delta: number) => {
      e.preventDefault();
      const target = new Date(view.y, view.mo, d + delta);
      setView({ y: target.getFullYear(), mo: target.getMonth() });
      requestAnimationFrame(() => {
        gridRef.current
          ?.querySelector<HTMLElement>(`[data-day='${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}']`)
          ?.focus();
      });
    };
    if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowRight") move(1);
    else if (e.key === "ArrowUp") move(-7);
    else if (e.key === "ArrowDown") move(7);
    else if (e.key === "Home") move(-(monFirst(new Date(view.y, view.mo, d).getDay())));
    else if (e.key === "End") move(6 - monFirst(new Date(view.y, view.mo, d).getDay()));
    else if (e.key === "PageUp") {
      e.preventDefault();
      shiftMonth(-1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      shiftMonth(1);
    }
  };

  const focusDay = parsed && parsed.y === view.y && parsed.mo === view.mo ? parsed.d : isTodayMonth(view, today) ? today.getDate() : 1;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={clsx(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-gray-50 px-3 text-sm text-gray-900",
          "transition-[transform,border-color,box-shadow] duration-[var(--dur-press)] ease-[var(--ease-out)]",
          "motion-safe:active:scale-[0.99] focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
          open ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-40",
          className,
        )}
      >
        <span className={value ? "text-ink tabular-nums" : "text-gray-500"}>{value ? fmtDisplay(value) : placeholder}</span>
        {CalendarIcon}
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
                "z-[80] rounded-xl border border-line bg-surface p-3 shadow-xl",
                coords.placement === "bottom" ? "origin-top" : "origin-bottom",
                "motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">
                  {MONTHS_TR[view.mo]} {view.y}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Önceki ay"
                    onClick={() => shiftMonth(-1)}
                    className="grid h-8 w-8 place-items-center rounded-md text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Sonraki ay"
                    onClick={() => shiftMonth(1)}
                    className="grid h-8 w-8 place-items-center rounded-md text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Chevron dir="right" />
                  </button>
                </div>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS_TR.map((w) => (
                  <span key={w} className="grid h-8 place-items-center text-xs font-medium text-muted">
                    {w}
                  </span>
                ))}
              </div>

              <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-0.5">
                {cells.map((d, i) =>
                  d === null ? (
                    <span key={`e${i}`} aria-hidden className="h-9" />
                  ) : (
                    <button
                      key={d}
                      type="button"
                      role="gridcell"
                      data-day={iso(view.y, view.mo, d)}
                      data-focus={d === focusDay ? "true" : undefined}
                      tabIndex={d === focusDay ? 0 : -1}
                      aria-pressed={isSelected(d)}
                      aria-current={isToday(d) ? "date" : undefined}
                      aria-label={`${d} ${MONTHS_TR[view.mo]} ${view.y}`}
                      onClick={() => pick(d)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          pick(d);
                        } else {
                          onGridKey(e, d);
                        }
                      }}
                      className={clsx(
                        "grid h-9 place-items-center rounded-md text-sm tabular-nums outline-none transition-colors",
                        isSelected(d)
                          ? "bg-brand font-semibold text-white"
                          : isToday(d)
                            ? "font-semibold text-blue-800 ring-1 ring-blue-300 hover:bg-surface-2"
                            : "text-ink hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-1 focus-visible:ring-blue-500",
                      )}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Temizle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(iso(today.getFullYear(), today.getMonth(), today.getDate()));
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Bugün
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function isTodayMonth(view: { y: number; mo: number }, today: Date) {
  return view.y === today.getFullYear() && view.mo === today.getMonth();
}
