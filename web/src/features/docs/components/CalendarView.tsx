import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { memberName } from "../workspace.data";
import type { DataTable, TableRow } from "../workspace.types";

const DAY_MS = 86_400_000;
const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "YYYY-MM-DD" (veya parse edilebilir herhangi bir tarih) → gün başı ms, yoksa null. */
function parseDateMs(v: string): number | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

type CalItem = { row: TableRow; ms: number | null; label: string; person: string };
type DatedItem = CalItem & { ms: number };
type Urgency = "soon" | "late";

const CHIP: Record<Urgency, string> = {
  soon: "bg-blue-100 text-blue-900",
  late: "bg-amber-100 text-amber-900",
};
const DOT: Record<Urgency, string> = {
  soon: "bg-blue-600",
  late: "bg-amber-500",
};

/**
 * Takvim/ajanda görünümü — "sıradaki odak": tarih kolonundan canlı hesaplanır,
 * bugüne göre en yakın yaklaşan iş hero satır olarak öne çıkar; yaklaşan ve
 * gecikmiş teslimler altında sakin listeler hâlinde gruplanır. Göreli etiketler
 * (Bugün / Yarın / N gün gecikti) hem renk hem metin taşır (renk tek bilgi
 * taşıyıcısı değil); kontrast AAA eşiğinin üstündedir.
 */
export function CalendarView({ table }: { table: DataTable }) {
  const { t } = useTranslation("docs");
  const dateCol = table.columns.find((c) => c.type === "date");
  const labelCol = table.columns.find((c) => c.type === "text") ?? table.columns[0];
  const personCol = table.columns.find((c) => c.type === "person");

  if (!dateCol) {
    return <p className="text-sm text-muted">{t("table.noDate")}</p>;
  }

  const today = startOfDay(new Date());
  const items: CalItem[] = table.rows.map((r) => ({
    row: r,
    ms: parseDateMs(r.cells[dateCol.id] ?? ""),
    label: r.cells[labelCol.id] || "—",
    person: personCol && r.cells[personCol.id] ? memberName(r.cells[personCol.id]) : "",
  }));

  const dated = items.filter((i): i is DatedItem => i.ms !== null);
  const undated = items.filter((i) => i.ms === null);
  const upcoming = dated.filter((i) => i.ms >= today).sort((a, b) => a.ms - b.ms);
  const past = dated.filter((i) => i.ms < today).sort((a, b) => b.ms - a.ms);
  const next = upcoming[0] ?? null;
  const restUpcoming = upcoming.slice(1);

  const leaf = (ms: number) => {
    const d = new Date(ms);
    return { m: MONTHS_TR[d.getMonth()], day: d.getDate() };
  };
  const rel = (ms: number): { text: string; kind: Urgency } => {
    const delta = Math.round((ms - today) / DAY_MS);
    if (delta === 0) return { text: "Bugün", kind: "soon" };
    if (delta === 1) return { text: "Yarın", kind: "soon" };
    if (delta > 1) return { text: `${delta} gün sonra`, kind: "soon" };
    if (delta === -1) return { text: "Dün", kind: "late" };
    return { text: `${-delta} gün gecikti`, kind: "late" };
  };

  const chip = (kind: Urgency, text: string, extra = "") => (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold ${CHIP[kind]} ${extra}`}>
      {text}
    </span>
  );

  const compactRow = (i: DatedItem) => {
    const r = rel(i.ms);
    const { m, day } = leaf(i.ms);
    return (
      <li
        key={i.row.id}
        className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2 motion-reduce:transition-none"
      >
        <span className="w-12 flex-none text-xs tabular-nums text-muted sm:w-16">{`${day} ${m}`}</span>
        <span className={`h-2 w-2 flex-none rounded-full ${DOT[r.kind]}`} aria-hidden />
        <span className="min-w-0 flex-1 truncate">{i.label}</span>
        {chip(r.kind, r.text, "flex-none")}
        {i.person ? <span className="hidden max-w-[6rem] flex-none truncate text-xs text-muted sm:inline">{i.person}</span> : null}
      </li>
    );
  };

  // Açılır-kapanır ikincil bölüm (Yaklaşan / Geçmiş / Tarihsiz) — sayaç + kaydırma kutusu.
  const section = (title: string, count: number, children: ReactNode, openByDefault = false) => (
    <details
      {...(openByDefault ? { open: true } : {})}
      className="group mt-3 overflow-hidden rounded-lg border border-line bg-surface-2 transition-colors open:bg-surface motion-reduce:transition-none"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-xs font-semibold text-muted">{title}</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 text-[0.6875rem] font-semibold tabular-nums text-ink-2 ring-1 ring-line">
          {count}
        </span>
        <Icon
          name="chevronDown"
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-[var(--ease-out)] [[open]_&]:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="max-h-64 overflow-y-auto overscroll-contain px-2 pb-2">{children}</ul>
    </details>
  );

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="calendar" className="h-4 w-4" /> {t("table.calendar")} · {dateCol.name}
      </h3>

      {next ? (
        (() => {
          const r = rel(next.ms);
          const { m, day } = leaf(next.ms);
          return (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
              <div className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-lg bg-surface shadow-[inset_0_0_0_1px_#bfdbfe]">
                <span className="text-[0.6875rem] font-semibold text-blue-800">{m}</span>
                <span className="text-xl font-bold leading-none text-blue-900 tabular-nums">{day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-ink">{next.label}</span>
                  {chip("soon", `Sıradaki · ${r.text}`)}
                </div>
                {next.person ? (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <Icon name="userCircle" className="h-3.5 w-3.5" /> {next.person}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })()
      ) : (
        <p className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-sm text-muted">
          <Icon name="calendar" className="h-4 w-4 shrink-0 text-muted" /> {t("table.noUpcoming")}
        </p>
      )}

      {restUpcoming.length > 0
        ? section(t("table.upcoming"), restUpcoming.length, restUpcoming.map(compactRow), true)
        : null}

      {past.length > 0 ? section(t("table.pastDue"), past.length, past.map(compactRow)) : null}

      {undated.length > 0
        ? section(
            t("table.undated"),
            undated.length,
            undated.map((i) => (
              <li
                key={i.row.id}
                className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2 motion-reduce:transition-none"
              >
                <span className="w-12 flex-none text-xs text-muted sm:w-16">—</span>
                <span className="h-2 w-2 flex-none rounded-full bg-gray-300" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{i.label}</span>
                {i.person ? (
                  <span className="hidden max-w-[6rem] flex-none truncate text-xs text-muted sm:inline">{i.person}</span>
                ) : null}
              </li>
            )),
          )
        : null}
    </div>
  );
}
