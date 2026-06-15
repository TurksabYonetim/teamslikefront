import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { ganttBars } from "../workspace.tables";
import type { DataTable } from "../workspace.types";

/** Gantt zaman çizelgesi — tablonun ilk tarih kolonundan türetilir. */
export function GanttView({ table }: { table: DataTable }) {
  const { t } = useTranslation("docs");
  const bars = ganttBars(table);
  const dateCol = table.columns.find((c) => c.type === "date");

  if (bars.length === 0) {
    return <p className="text-sm text-muted">{t("table.noDate")}</p>;
  }

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="chartBar" className="h-4 w-4" /> {t("table.gantt")}
        {dateCol ? ` · ${dateCol.name}` : ""}
      </h3>
      <ul className="space-y-2">
        {bars.map((b) => (
          <li key={b.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-ink">{b.label}</span>
            <div className="relative h-3 flex-1 rounded-full bg-surface-3">
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand"
                style={{ left: `${b.startFrac * 100}%` }}
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
