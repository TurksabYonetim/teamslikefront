import * as React from "react";
import clsx from "clsx";

interface TooltipProps {
  /** İpucu metni. */
  label: string;
  /** Tetikleyiciye göre açılma yönü. */
  side?: "top" | "bottom";
  /** Tek bir etkileşimli çocuk (buton vb.) — aria-describedby ona bağlanır. */
  children: React.ReactElement;
}

/**
 * Native `title` yerine erişilebilir, katman sırası kontrol edilebilen ipucu.
 * z-40'ta kalır; açık dropdown/modal (z-50+) onun önündedir, böylece menüleri örtmez.
 * Native tooltip'ler OS katmanında çizildiği için bunu yapamaz — bu yüzden gereklidir.
 */
export function Tooltip({ label, side = "bottom", children }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {React.cloneElement(children, { "aria-describedby": open ? id : undefined })}
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={clsx(
            "pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 max-w-[min(16rem,calc(100vw-1rem))] whitespace-normal break-words text-balance rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            "motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)]",
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
