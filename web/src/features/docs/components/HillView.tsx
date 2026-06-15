import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { hillPoints } from "../workspace.tables";
import type { DataTable } from "../workspace.types";

/** Basecamp tarzı Hill chart — status (select) kolonundan: yokuş yukarı =
 *  çözülüyor, yokuş aşağı = uygulanıyor. */
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
          <circle key={p.id} cx={p.x * 100} cy={40 - p.y * 36} r="1.8" className="fill-brand" />
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {pts.map((p) => (
          <li key={p.id} className="flex items-center gap-1 text-sm text-ink">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden /> {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
