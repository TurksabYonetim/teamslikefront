// web/src/components/ui/Card.tsx
import type { ReactNode } from "react";
import clsx from "clsx";

/**
 * Paylaşılan yüzey kartı (rounded-xl + border-line + bg-surface + p-4). Daha önce
 * appointments/support/webinar feature'larında birebir kopyalanan yerel `Card`'ın
 * tek kaynağı. `className` ile padding/yerleşim override edilebilir.
 */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-xl border border-line bg-surface p-4", className)}>{children}</div>;
}
