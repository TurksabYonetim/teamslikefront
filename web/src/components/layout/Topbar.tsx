import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-5 border-b border-line bg-surface">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      {subtitle && <span className="text-muted text-xs">{subtitle}</span>}
      <div className="flex-1" />
      {actions}
    </header>
  );
}
