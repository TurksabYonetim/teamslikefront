// web/src/components/ui/ProductTour.tsx
import * as React from "react";
import clsx from "clsx";
import { HiOutlineXMark } from "react-icons/hi2";

export interface TourStep {
  /** Vurgulanacak elemanın DOM id'si (yoksa ortada modal-step). */
  targetId?: string;
  title: string;
  body: string;
  /** Bu adımda açılacak sekme anahtarı (onStep'e iletilir). */
  tab?: string;
}

export interface TourLabels {
  back: string;
  next: string;
  skip: string;
  finish: string;
  /** Köşedeki kapat (X) butonunun erişilebilir adı (Skip'ten ayrı). */
  close: string;
  /** "{{n}}/{{total}}" — n ve total değiştirilir. */
  step: string;
}

const DEFAULT_LABELS: TourLabels = {
  back: "Back",
  next: "Next",
  skip: "Skip",
  finish: "Finish",
  close: "Close",
  step: "{{n}}/{{total}}",
};

interface ProductTourProps {
  open: boolean;
  steps: TourStep[];
  /** Bitir veya Atla → çağrılır (caller markSeen + kapatır). */
  onFinish: () => void;
  /** Her adıma girişte (sekme değiştirme vb.). */
  onStep?: (step: TourStep, index: number) => void;
  labels?: Partial<TourLabels>;
}

export function ProductTour({ open, steps, onFinish, onStep, labels }: ProductTourProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [i, setI] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  // (Yeniden) açılışta başa sar.
  React.useEffect(() => {
    if (open) setI(0);
  }, [open]);

  // Adım girişinde: onStep + hedefi ölç.
  React.useEffect(() => {
    if (!open) return;
    const step = steps[i];
    if (!step) return;
    onStep?.(step, i);
    const measure = () => {
      if (!step.targetId) {
        setRect(null);
        return;
      }
      const el = document.getElementById(step.targetId);
      setRect(el ? el.getBoundingClientRect() : null);
      if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    const tid = window.setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(tid);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i]);

  const last = i === steps.length - 1;
  const goNext = () => (last ? onFinish() : setI((p) => Math.min(steps.length - 1, p + 1)));
  const goBack = () => setI((p) => Math.max(0, p - 1));

  // Klavye.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i, steps.length]);

  if (!open || steps.length === 0) return null;
  const step = steps[i];

  // Popover konumu: hedef varsa altına (yoksa üstüne), yoksa ortada.
  const popStyle: React.CSSProperties = rect
    ? rect.bottom + 180 < window.innerHeight
      ? { top: rect.bottom + 12, left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)) }
      : { top: Math.max(12, rect.top - 180), left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)) }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div role="dialog" aria-modal="true" aria-label={step.title} className="fixed inset-0 z-[60]">
      {/* Karartma + spotlight (box-shadow ile delik) */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-lg ring-2 ring-brand motion-safe:transition-[top,left,width,height] motion-safe:duration-[var(--dur-modal)] motion-safe:ease-[var(--ease-out)]"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.55)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/55 motion-safe:[animation:tl-fade_var(--dur-modal)_var(--ease-out)]" />
      )}

      {/* Popover */}
      <div
        className="fixed z-[61] w-80 max-w-[calc(100vw-1.5rem)] rounded-lg border border-line bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800 origin-top-left motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]"
        style={popStyle}
      >
        <div className="mb-1 flex items-start gap-2">
          <h3 className="flex-1 text-base font-semibold text-ink dark:text-white">{step.title}</h3>
          <button
            type="button"
            onClick={onFinish}
            aria-label={L.close}
            className="rounded-md p-1 text-muted transition-transform active:scale-[0.97] hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            <HiOutlineXMark className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="text-sm text-ink-2 dark:text-gray-300">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted">
            {L.step.replace("{{n}}", String(i + 1)).replace("{{total}}", String(steps.length))}
          </span>
          <button
            type="button"
            onClick={onFinish}
            className="ms-auto rounded-md px-2 py-1 text-sm text-muted transition-transform active:scale-[0.97] hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            {L.skip}
          </button>
          {i > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-md border border-line px-3 py-1 text-sm text-ink hover:bg-surface-2 dark:border-gray-700 dark:text-white"
            >
              {L.back}
            </button>
          ) : null}
          <button
            type="button"
            onClick={goNext}
            className={clsx("rounded-md bg-brand px-3 py-1 text-sm font-medium text-white transition-transform active:scale-[0.97] hover:bg-brand-600")}
          >
            {last ? L.finish : L.next}
          </button>
        </div>
      </div>
    </div>
  );
}
