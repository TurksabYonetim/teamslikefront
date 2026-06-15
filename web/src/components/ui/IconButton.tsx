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
      title={label}
      aria-pressed={primary}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        primary
          ? "bg-brand text-white"
          : "text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
