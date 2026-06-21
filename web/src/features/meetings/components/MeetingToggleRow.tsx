import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

/**
 * Tek tip toplantı ayar satırı (tasarım sistemi kartı).
 * Açık durum marka-tintli (`border-brand/40 bg-brand/5`), durum etiketi AAA (`text-blue-800`).
 * Tüm toplantı panellerinde aynı görünür — bkz. DESIGN.md "aynı rol her yerde aynı".
 */
export function MeetingToggleRow({
  label,
  on,
  onToggle,
  icon,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  icon: ReactNode;
}) {
  const { t } = useTranslation("meetings");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={clsx(
        "flex h-11 w-full items-center gap-2 rounded-md border px-3 text-sm text-ink motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        on ? "border-brand/40 bg-brand/5 hover:bg-brand/10" : "border-line hover:bg-surface-2",
      )}
    >
      <span className={clsx("flex shrink-0", on ? "text-brand" : "text-muted")}>{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      <span className={clsx("text-sm font-medium", on ? "text-blue-800" : "text-muted")}>
        {on ? t("on") : t("off")}
      </span>
    </button>
  );
}
