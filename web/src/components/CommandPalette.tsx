import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Overlay } from "@/components/ui/Overlay";
import { NAV_ITEMS } from "@/components/layout/nav";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/** trLower: Türkçe duyarlı küçük harf (İ/I sorunlarını önler) */
function trLower(s: string) {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

/**
 * Global komut paleti (Cmd/Ctrl+K). Tüm modüller arasında hızlı gezinme.
 * emil: overlay fade, panel scale(0.97)→1 ease-out, klavye-öncelikli (animasyonsuz his).
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = trLower(query.trim());
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter((it) => trLower(it.label).includes(q));
  }, [query]);

  // açılışta sıfırla + odakla
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // bir sonraki frame'de odakla (panel mount sonrası)
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [open]);

  // aktif index'i sonuç sayısına sıkıştır
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!open) return null;

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) =>
        results.length ? (a - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) go(item.to);
    }
  };

  return (
    <Overlay open onClose={onClose} align="top" level="high">
      <div
        className="w-full max-w-lg sm:max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-black/5 origin-top motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)]"
        role="dialog"
        aria-modal="true"
        aria-label="Komut paleti"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sayfalarda ara…"
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
            aria-label="Sayfa ara"
          />
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-xs text-muted sm:inline">
            ESC
          </kbd>
        </div>

        <ul className="max-h-80 sm:max-h-96 overflow-y-auto p-2" role="listbox">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">
              Sonuç yok
            </li>
          )}
          {results.map((it, i) => (
            <li key={it.to}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(it.to)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-[transform,colors] duration-[120ms] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
                  i === active
                    ? "bg-brand text-white"
                    : "text-ink hover:bg-surface-2",
                )}
              >
                <Icon
                  name={it.icon}
                  className={clsx(
                    "h-4 w-4 shrink-0",
                    i === active ? "text-white" : "text-muted",
                  )}
                />
                <span className="flex-1">{it.label}</span>
                <Icon
                  name="arrow"
                  className={clsx(
                    "h-3.5 w-3.5 opacity-0",
                    i === active && "opacity-70",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Overlay>
  );
}
