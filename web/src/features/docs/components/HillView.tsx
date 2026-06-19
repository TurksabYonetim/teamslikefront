import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { hillPoints } from "../workspace.tables";
import type { DataTable } from "../workspace.types";

/** Bilinen kanban durumları için tepe rengi + bölge adı; bilinmeyen değer nötr. */
const STATUS_META: Record<string, { dot: string; cardBg: string; cardText: string; zone: string }> = {
  todo: { dot: "fill-blue-600", cardBg: "bg-blue-50", cardText: "text-blue-900", zone: "Çözülüyor" },
  doing: { dot: "fill-amber-500", cardBg: "bg-amber-50", cardText: "text-amber-900", zone: "Zirvede" },
  in_progress: { dot: "fill-amber-500", cardBg: "bg-amber-50", cardText: "text-amber-900", zone: "Zirvede" },
  done: { dot: "fill-green-600", cardBg: "bg-green-50", cardText: "text-green-900", zone: "Uygulanıyor" },
};
const NEUTRAL = { dot: "fill-gray-400", cardBg: "bg-surface-2", cardText: "text-ink-2", zone: "" };
const metaFor = (s: string) => STATUS_META[s] ?? NEUTRAL;

/**
 * Basecamp tarzı Hill chart — status (select) kolonundan: yokuş yukarı =
 * çözülüyor, yokuş aşağı = uygulanıyor. Noktalar duruma göre renklenir ve
 * eğrinin altında durum dağılımı (bölge başına sayım) verilir; durum hem renk
 * hem metinle taşınır (renk tek bilgi taşıyıcısı değil), kartlarda metin AAA.
 */
export function HillView({ table }: { table: DataTable }) {
  const { t } = useTranslation("docs");
  const pts = hillPoints(table);
  const statusCol = table.columns.find((c) => c.type === "select");

  if (pts.length === 0) {
    return <p className="text-sm text-muted">{t("table.noStatus")}</p>;
  }

  const curve = Array.from({ length: 51 }, (_, i) => {
    const x = i / 50;
    const y = Math.sin(x * Math.PI);
    return `${i === 0 ? "M" : "L"} ${(x * 100).toFixed(1)} ${(40 - y * 36).toFixed(1)}`;
  }).join(" ");

  const statusById = new Map(table.rows.map((r) => [r.id, statusCol ? r.cells[statusCol.id] ?? "" : ""]));
  const options = statusCol?.options ?? [];
  const dist = options.map((opt) => ({
    opt,
    n: table.rows.filter((r) => (r.cells[statusCol!.id] ?? "") === opt).length,
    meta: metaFor(opt),
  }));

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="chartBar" className="h-4 w-4" /> {t("table.hill")}
        {statusCol ? ` · ${statusCol.name}` : ""}
      </h3>
      <svg viewBox="0 0 100 44" className="w-full text-line" role="img" aria-label={t("table.hill")}>
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="0.6" />
        <line x1="50" y1="2" x2="50" y2="44" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1.5" />
        {pts.map((p) => (
          <circle
            key={p.id}
            cx={p.x * 100}
            cy={40 - p.y * 36}
            r="2.2"
            className={`${metaFor(statusById.get(p.id) ?? "").dot} stroke-white`}
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {dist.length > 0 ? (
        <div
          className="mt-2 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${dist.length}, minmax(0, 1fr))` }}
        >
          {dist.map((d) => (
            <div key={d.opt} className={`rounded-lg border border-line px-3 py-2 ${d.meta.cardBg}`}>
              <div className={`text-lg font-bold tabular-nums ${d.meta.cardText}`}>{d.n}</div>
              <div className={`text-xs ${d.meta.cardText}`}>{d.meta.zone || d.opt}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
