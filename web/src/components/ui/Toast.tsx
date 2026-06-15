import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
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

/** Giriş/çıkış animasyon süresi ile uyumlu olmalı (--dur-toast). */
const EXIT_MS = 260;
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
  const seq = useRef(0);

  /** Çıkış animasyonunu tetikle, bitince DOM'dan kaldır. */
  const dismiss = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = ++seq.current;
      setItems((prev) => [...prev, { ...t, id }]);
      const ms = t.duration ?? 4000;
      window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        role="region"
        aria-live="polite"
      >
        {items.map((t) => (
          <ToastRow key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Tek toast satırı. emil:
 * - Giriş: mount sonrası rAF ile alttan kayarak + ölçeklenerek belirir.
 * - Çıkış: `leaving` ile aynı yönde (aşağı) kaybolur — keyframe değil,
 *   kesintiye uğrayabilen CSS transition kullanılır.
 */
function ToastRow({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const visible = entered && !item.leaving;

  return (
    <div
      data-state={visible ? "open" : "closed"}
      className={clsx(
        "min-w-[260px] max-w-sm rounded-lg shadow-lg px-4 py-3 text-sm flex items-center gap-3",
        "border bg-surface text-ink border-line",
        "transition-[transform,opacity] duration-[var(--dur-toast)] ease-[var(--ease-out)]",
        "data-[state=closed]:translate-y-2 data-[state=closed]:scale-[0.96] data-[state=closed]:opacity-0",
        "data-[state=open]:translate-y-0 data-[state=open]:scale-100 data-[state=open]:opacity-100",
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full shrink-0",
          item.variant === "success" && "bg-ok",
          item.variant === "error" && "bg-danger",
          item.variant === "warning" && "bg-warn",
          (!item.variant || item.variant === "default") && "bg-brand",
        )}
      />
      <span className="flex-1">{item.message}</span>
      {item.action && (
        <button
          className="font-medium text-brand rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          onClick={() => {
            item.action!.onClick();
            onDismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      )}
    </div>
  );
}
