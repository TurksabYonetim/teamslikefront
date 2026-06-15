import clsx from "clsx";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "ghost" | "primary";
}

export function IconButton({ label, variant = "ghost", className, children, ...rest }: IconButtonProps) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={primary}
      title={label}
      className={clsx(
        "inline-flex h-9 w-9 min-h-11 min-w-11 items-center justify-center rounded-md transition-[transform,background-color,color] motion-safe:active:scale-[0.97] ease-[var(--ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        primary
          ? "bg-brand text-white"
          : "text-muted hover:bg-surface-2 dark:hover:bg-gray-700",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
