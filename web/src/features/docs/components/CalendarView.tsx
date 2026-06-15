import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { memberName } from "../workspace.data";
import type { DataTable, TableRow } from "../workspace.types";

/** Takvim/ajanda görünümü — tablonun ilk tarih kolonundan canlı hesaplanır. */
export function CalendarView({ table }: { table: DataTable }) {
  const { t } = useTranslation("docs");
  const dateCol = table.columns.find((c) => c.type === "date");
  const labelCol = table.columns.find((c) => c.type === "text") ?? table.columns[0];
  const personCol = table.columns.find((c) => c.type === "person");

  if (!dateCol) {
    return <p className="text-sm text-muted">{t("table.noDate")}</p>;
  }

  const byDate = new Map<string, TableRow[]>();
  for (const r of table.rows) {
    const d = r.cells[dateCol.id] || t("table.noDate");
    const bucket = byDate.get(d) ?? [];
    bucket.push(r);
    byDate.set(d, bucket);
  }
  const dates = [...byDate.keys()].sort();

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="calendar" className="h-4 w-4" /> {t("table.calendar")} · {dateCol.name}
      </h3>
      <ul className="space-y-3">
        {dates.map((d) => (
          <li key={d}>
            <div className="text-sm font-semibold text-ink">{d}</div>
            <ul className="ml-3 mt-1 space-y-1">
              {byDate.get(d)!.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm text-ink">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span className="flex-1 truncate">{r.cells[labelCol.id] || "—"}</span>
                  {personCol ? (
                    <span className="text-muted">{r.cells[personCol.id] ? memberName(r.cells[personCol.id]) : ""}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
