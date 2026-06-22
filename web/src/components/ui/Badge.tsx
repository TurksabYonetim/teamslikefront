import clsx from "clsx";

type Tone = "neutral" | "accent" | "info" | "positive" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-3 text-ink-2 dark:bg-gray-700 dark:text-gray-300",
  accent: "bg-brand text-white",
  // Hafif mavi bilgi tonu (DESIGN.md): solid marka yerine düşük vurgu, AAA (blue-800 8.7:1).
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  positive: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TONES[tone], className)}>
      {children}
    </span>
  );
}
