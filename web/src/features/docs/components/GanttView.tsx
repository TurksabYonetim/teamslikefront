import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { ganttBars } from "../workspace.tables";
import type { DataTable, TableRow } from "../workspace.types";

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** Bilinen kanban durumları için kulvar etiketi + renk; bilinmeyen değer ham kalır. */
const STATUS_META: Record<string, { label: string; lane: string; dot: string; text: string }> = {
  todo: { label: "Yapılacak", lane: "bg-blue-50", dot: "bg-blue-600", text: "text-blue-900" },
  doing: { label: "Devam ediyor", lane: "bg-amber-50", dot: "bg-amber-600", text: "text-amber-900" },
  in_progress: { label: "Devam ediyor", lane: "bg-amber-50", dot: "bg-amber-600", text: "text-amber-900" },
  done: { label: "Bitti", lane: "bg-green-50", dot: "bg-green-600", text: "text-green-900" },
};
const NEUTRAL_META = { label: "—", lane: "bg-surface-2", dot: "bg-gray-400", text: "text-ink-2" };

const fmtDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  return m ? `${Number(m[3])} ${MONTHS_TR[Number(m[2]) - 1]}` : s || "";
};

/**
 * Gantt zaman çizelgesi — "durum şeritleri": her satır, ilk tarih kolonunun
 * min→max ekseninde konumlanır (paylaşılan eksen); satırlar select/durum
 * kolonuna göre kulvarlara ayrılır. Kulvar etiketi + renk durumu hem metin hem
 * renkle taşır (renk tek bilgi taşıyıcısı değil); tonlu zeminlerde metin AAA.
 */
export function GanttView({ table }: { table: DataTable }) {
  const { t } = useTranslation("docs");
  const dateCol = table.columns.find((c) => c.type === "date");
  const statusCol = table.columns.find((c) => c.type === "select");
  const bars = ganttBars(table);

  if (bars.length === 0) {
    return <p className="text-sm text-muted">{t("table.noDate")}</p>;
  }

  const fracById = new Map(bars.map((b) => [b.id, b.startFrac]));
  const labelById = new Map(bars.map((b) => [b.id, b.label]));

  // Durum kolonu varsa kulvarlara grupla; yoksa tek kulvar.
  const groups: { key: string; meta: typeof NEUTRAL_META; rows: TableRow[] }[] = [];
  if (statusCol) {
    const order = statusCol.options ?? [];
    const seen = new Set<string>();
    for (const opt of order) {
      const rows = table.rows.filter((r) => (r.cells[statusCol.id] ?? "") === opt);
      if (rows.length === 0) continue;
      seen.add(opt);
      groups.push({ key: opt, meta: STATUS_META[opt] ?? { ...NEUTRAL_META, label: opt }, rows });
    }
    const rest = table.rows.filter((r) => !seen.has(r.cells[statusCol.id] ?? ""));
    if (rest.length > 0) groups.push({ key: "__rest", meta: NEUTRAL_META, rows: rest });
  } else {
    groups.push({ key: "__all", meta: { ...NEUTRAL_META, label: table.title }, rows: table.rows });
  }

  const dates = table.rows.map((r) => (dateCol ? r.cells[dateCol.id] : "")).filter(Boolean).sort();
  const rangeHint = dates.length >= 2 ? `${fmtDate(dates[0])} → ${fmtDate(dates[dates.length - 1])}` : "";

  return (
    <div className="min-w-0">
      <h3 className="mb-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="chartBar" className="h-4 w-4" /> {t("table.gantt")}
        {statusCol ? ` · ${statusCol.name}` : dateCol ? ` · ${dateCol.name}` : ""}
        {rangeHint ? <span className="ml-1 text-xs font-normal text-muted tabular-nums">{rangeHint}</span> : null}
      </h3>

      {/* Mobil (< md): pozisyonlu eksen dar ekranda çakışır → duruma göre gruplu sade liste */}
      <ul className="space-y-2 md:hidden">
        {groups.map((g) => (
          <li key={g.key} className={`rounded-lg px-3 py-2.5 ${g.meta.lane}`}>
            <div className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold ${g.meta.text}`}>
              <span className={`h-2 w-2 flex-none rounded-full ${g.meta.dot}`} aria-hidden />
              {g.meta.label}
            </div>
            <ul className="space-y-1">
              {g.rows.map((r) => {
                const label = labelById.get(r.id) || "—";
                const date = dateCol ? fmtDate(r.cells[dateCol.id] ?? "") : "";
                return (
                  <li key={r.id} className="flex items-center gap-2 text-sm text-ink">
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {date ? <span className="flex-none text-xs tabular-nums text-muted">{date}</span> : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {/* md+: paylaşılan eksende pozisyonlu Gantt zaman çizelgesi */}
      <ul className="hidden space-y-2 md:block">
        {groups.map((g) => (
          <li key={g.key} className={`grid grid-cols-[7rem_1fr] items-center gap-3 rounded-lg px-2.5 py-2 ${g.meta.lane}`}>
            <span className={`inline-flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-semibold ${g.meta.text}`}>
              <span className={`h-2 w-2 flex-none rounded-full ${g.meta.dot}`} aria-hidden /> <span className="truncate">{g.meta.label}</span>
            </span>
            <div className="relative h-4 min-w-0 overflow-hidden">
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-line" aria-hidden />
              {g.rows.map((r) => {
                const frac = fracById.get(r.id) ?? 0;
                const label = labelById.get(r.id) || "—";
                const date = dateCol ? fmtDate(r.cells[dateCol.id] ?? "") : "";
                return (
                  <span
                    key={r.id}
                    className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1"
                    style={{ left: `${frac * 100}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <span className={`h-3 w-3 flex-none rounded-full border-2 border-white ${g.meta.dot} shadow-[0_0_0_1px_rgba(16,24,40,0.12)]`} aria-hidden />
                    <span className="max-w-[40vw] truncate whitespace-nowrap rounded bg-surface/85 px-1 text-[0.6875rem] text-ink sm:max-w-none">
                      {label}
                      {date ? <span className="text-muted"> · {date}</span> : null}
                    </span>
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
