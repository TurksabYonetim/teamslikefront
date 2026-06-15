import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Inline alan hatası (varsa kırmızı kenarlık + aria-invalid). */
  error?: string;
  /** Etiket altı yardımcı metin. */
  hint?: string;
  /** Parola alanı için göster/gizle düğmesi etiketleri. */
  reveal?: { show: string; hide: string };
}

/** Tutarlı auth giriş alanı: label + hint + inline hata + a11y bağları. */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    { label, error, hint, reveal, className, type = "text", ...rest },
    ref,
  ) {
    const autoId = useId();
    const id = rest.name ? `auth-${rest.name}` : autoId;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && revealed ? "text" : type;

    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-ink dark:text-white"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={effectiveType}
            aria-invalid={error ? true : undefined}
            aria-describedby={clsx(errorId, hintId) || undefined}
            className={clsx(
              "block w-full rounded-lg border bg-surface-2 p-2.5 text-sm text-ink outline-none",
              "placeholder:text-muted",
              "transition-[border-color,box-shadow] duration-[140ms] ease-[var(--ease-out)]",
              "focus:border-brand focus:ring-2 focus:ring-brand-soft",
              "dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400",
              error
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-line dark:border-gray-600",
              isPassword && reveal && "pr-11",
              className,
            )}
            {...rest}
          />
          {isPassword && reveal && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? reveal.hide : reveal.show}
              aria-pressed={revealed}
              className={clsx(
                "absolute inset-y-0 right-0 flex w-11 items-center justify-center",
                "text-muted hover:text-ink-2 dark:hover:text-white",
                "transition-[color,transform] duration-[140ms] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
                "rounded-r-lg outline-none focus-visible:ring-2 focus-visible:ring-brand",
              )}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

function EyeIcon(): ReactNode {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.65 1.65 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.147.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeOffIcon(): ReactNode {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.03 10.03 0 003.3-4.38 1.65 1.65 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" />
      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
    </svg>
  );
}
