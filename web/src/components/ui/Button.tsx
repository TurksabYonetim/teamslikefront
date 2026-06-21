import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";
import { CONTROL_HEIGHT } from "./controlSize";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand",
  secondary:
    "bg-white text-ink border border-line hover:bg-surface-2 focus-visible:ring-brand",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-3 focus-visible:ring-brand",
  danger: "bg-danger text-white hover:brightness-95 focus-visible:ring-danger",
};

// md = varsayılan responsive standart (Input/Select ile aynı yükseklik ölçeği).
// sm/lg sabit kalır — yoğun ya da öne çıkan tekil aksiyonlar için açık seçim.
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: `${CONTROL_HEIGHT} px-4 text-sm gap-2`,
  lg: "h-11 px-5 text-sm gap-2",
};

/** emil: :active scale(0.97) + custom ease-out, transform-only geçiş. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium select-none",
        "transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] active:scale-[0.97]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:opacity-60 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner className="w-4 h-4 border-white/40 border-t-white" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
});
