import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 lg:h-16 shrink-0 flex items-center gap-3 px-5 lg:px-7 xl:px-8 border-b border-line bg-surface">
      <div className="min-w-0 flex items-center gap-3">
        <h1 className="truncate text-lg sm:text-xl lg:text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <span className="hidden md:inline min-w-0 truncate text-muted text-xs">{subtitle}</span>}
      </div>
      <div className="flex-1" />
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
