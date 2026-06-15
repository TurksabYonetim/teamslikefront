import type { ReactNode } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center px-6 py-12 gap-3",
        className,
      )}
    >
      {icon && (
        <div className="grid place-items-center h-12 w-12 rounded-full bg-surface-3 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
