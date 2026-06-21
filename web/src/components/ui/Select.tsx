import * as React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

/**
 * Tek tip, erişilebilir özel `Select` (listbox) bileşeni.
 *
 * Neden native `<select>` değil: tarayıcının native açılır listesi stillenemez,
 * marka tipografisi/animasyonu uygulanamaz ve OS'a göre farklı görünür. Bu bileşen
 * tetikleyici (combobox button) + portal'lı `role="listbox"` paneli ile site
 * genelinde TEK standart açılır menüyü verir.
 *
 * Erişilebilirlik (WCAG 2.2 AAA hedefi):
 *  - Tam klavye navigasyonu: ↑/↓ ile gezinme, Home/End, harf yazarak (type-ahead)
 *    eşleştirme, Enter/Space ile seçme, Esc/Tab ile kapatma.
 *  - `role="combobox"` + `role="listbox"`/`role="option"`, `aria-selected`,
 *    `aria-activedescendant` ile sanal odak; `aria-expanded`, `aria-controls`.
 *  - 7:1+ kontrast: metin `text-ink`, ikincil `text-ink-3` (7.6:1) token'ları.
 *  - 44px dokunma hedefi (h-11), tam görünür `focus-visible` halkası.
 *
 * Hareket (emil-design-eng): panel tetikleyiciden ölçeklenerek açılır
 * (origin-aware, merkez değil), `tl-pop-in` + `--ease-out`; tetikleyici basışta
 * `scale(0.97)`. Tümü `motion-safe:` arkasında.
 */

export interface SelectOption<T extends string = string> {
  value: T;
  /** Listede ve seçili durumda gösterilen birincil etiket. */
  label: React.ReactNode;
  /** Etikete eşlik eden ikincil açıklama satırı (opsiyonel). */
  description?: string;
  /** Sol tarafta gösterilecek ikon (opsiyonel). */
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Görünür etiket — verilirse <label> render edilir ve tetikleyiciye bağlanır. */
  label?: string;
  /** Görünür etiket yokken erişilebilir ad. label varsa gerekmez. */
  "aria-label"?: string;
  /** Seçili değer listede yoksa gösterilecek yer tutucu. */
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  /** Tetikleyiciye ek sınıf (genişlik vb.). Varsayılan tam genişlik. */
  className?: string;
  /** Açılma yönü. "auto" boşluğa göre seçer. */
  side?: "top" | "bottom" | "auto";
  size?: "sm" | "md";
}

const CHEVRON = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3">
    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHECK = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-brand">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  "aria-label": ariaLabel,
  placeholder,
  disabled = false,
  required = false,
  id,
  className,
  side = "auto",
  size = "md",
}: SelectProps<T>) {
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const listboxId = `${baseId}-listbox`;
  const labelId = label ? `${baseId}-label` : undefined;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [coords, setCoords] = React.useState<{
    left?: number;
    right?: number;
    top: number;
    width: number;
    maxWidth: number;
    placement: "top" | "bottom";
    maxHeight: number;
  } | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const typeahead = React.useRef<{ str: string; at: number }>({ str: "", at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const firstEnabled = React.useCallback(
    (from: number, dir: 1 | -1) => {
      const n = options.length;
      for (let step = 0; step < n; step++) {
        const i = (((from + dir * step) % n) + n) % n;
        if (!options[i].disabled) return i;
      }
      return -1;
    },
    [options],
  );

  // Tetikleyici dikdörtgenine göre panel konumunu hesapla (overflow:hidden
  // kapsayıcılardan kaçmak için position:fixed + portal — impeccable kuralı).
  const computeCoords = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - r.bottom - margin;
    const spaceAbove = r.top - margin;
    const placement: "top" | "bottom" =
      side === "auto" ? (spaceBelow < 224 && spaceAbove > spaceBelow ? "top" : "bottom") : side;
    const maxHeight = Math.min(320, Math.max(120, placement === "bottom" ? spaceBelow : spaceAbove));
    // Yatay: panel içeriğe göre genişleyebilsin (min = tetikleyici genişliği) ama
    // viewport'tan taşmasın. Dar tetikleyicilerde seçenekler kesilmesin diye genişler;
    // sağda yer azsa sağ kenara hizalanır (align-end), soldan büyür.
    const spaceRight = window.innerWidth - r.left - margin; // sola hizalıysa kullanılabilir genişlik
    const spaceLeft = r.right - margin; // sağa hizalıysa kullanılabilir genişlik
    const anchorRight = spaceRight < 240 && spaceLeft > spaceRight;
    const maxWidth = Math.min(420, anchorRight ? spaceLeft : spaceRight);
    setCoords({
      left: anchorRight ? undefined : r.left,
      right: anchorRight ? window.innerWidth - r.right : undefined,
      top: placement === "bottom" ? r.bottom + 4 : r.top - 4,
      width: r.width,
      maxWidth,
      placement,
      maxHeight,
    });
  }, [side]);

  React.useLayoutEffect(() => {
    if (!open) return;
    computeCoords();
    const onScroll = () => computeCoords();
    const onResize = () => computeCoords();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, computeCoords]);

  // Açılınca seçili (yoksa ilk uygun) öğeyi aktif yap ve listeye odaklan.
  React.useEffect(() => {
    if (!open) return;
    const start = selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : firstEnabled(0, 1);
    setActiveIndex(start);
    const raf = requestAnimationFrame(() => listRef.current?.focus());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Aktif öğeyi görünür alana kaydır.
  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    // scrollIntoView jsdom/SSR ortamlarında tanımsız olabilir → opsiyonel çağrı.
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Dış tıklama ile kapat (tetikleyici ve panel dışında).
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (i: number) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    close();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => firstEnabled(i < 0 ? 0 : i + 1, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => firstEnabled(i < 0 ? options.length - 1 : i - 1, -1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(firstEnabled(0, 1));
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(firstEnabled(options.length - 1, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        // Type-ahead: yazılan harflerle etiket başına göre eşleştir.
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const now = Date.now();
          const buf = now - typeahead.current.at > 500 ? e.key : typeahead.current.str + e.key;
          typeahead.current = { str: buf, at: now };
          const labelText = (o: SelectOption<T>) =>
            (typeof o.label === "string" ? o.label : String(o.value)).toLowerCase();
          const match = options.findIndex((o) => !o.disabled && labelText(o).startsWith(buf.toLowerCase()));
          if (match >= 0) setActiveIndex(match);
        }
        break;
    }
  };

  const triggerPad = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-3.5 text-sm";

  return (
    <div className={clsx("inline-flex flex-col", className?.includes("w-full") || !className ? "w-full" : undefined)}>
      {label ? (
        <label id={labelId} htmlFor={baseId} className="mb-2 block text-sm font-medium text-ink">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={labelId}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={clsx(
          "inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-surface text-start text-ink",
          "transition-[transform,border-color,box-shadow] duration-[var(--dur-press)] ease-[var(--ease-out)]",
          "motion-safe:active:scale-[0.99]",
          "focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
          open ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-60",
          triggerPad,
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon ? <span className="shrink-0">{selected.icon}</span> : null}
          <span className={clsx("truncate", !selected && "text-ink-3")}>
            {selected ? selected.label : placeholder ?? ""}
          </span>
        </span>
        <span
          className={clsx(
            "transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        >
          {CHEVRON}
        </span>
      </button>

      {open && coords
        ? createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={labelId}
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              onKeyDown={onListKeyDown}
              style={{
                position: "fixed",
                left: coords.left,
                right: coords.right,
                top: coords.placement === "bottom" ? coords.top : undefined,
                bottom: coords.placement === "top" ? window.innerHeight - coords.top : undefined,
                minWidth: coords.width,
                maxWidth: coords.maxWidth,
                width: "max-content",
                maxHeight: coords.maxHeight,
              }}
              className={clsx(
                "z-[80] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-1 shadow-xl outline-none",
                coords.placement === "bottom"
                  ? coords.right != null
                    ? "origin-top-right"
                    : "origin-top-left"
                  : coords.right != null
                    ? "origin-bottom-right"
                    : "origin-bottom-left",
                "motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]",
              )}
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={opt.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    onClick={() => choose(i)}
                    onPointerMove={() => !opt.disabled && setActiveIndex(i)}
                    className={clsx(
                      "flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                      opt.disabled
                        ? "cursor-not-allowed text-ink-3 opacity-60"
                        : isActive
                          ? "bg-surface-2 text-ink"
                          : "text-ink",
                    )}
                  >
                    {opt.icon ? <span className="shrink-0">{opt.icon}</span> : null}
                    <span className="min-w-0 flex-1">
                      <span className={clsx("block truncate", isSelected && "font-semibold")}>{opt.label}</span>
                      {opt.description ? (
                        <span className="mt-0.5 block truncate text-xs text-ink-3">{opt.description}</span>
                      ) : null}
                    </span>
                    {isSelected ? CHECK : null}
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
