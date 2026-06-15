import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { useAdminStore } from "../governance.store";
import { filterAudit, retentionExpired } from "../admin.governance";

const REGIONS = ["global", "eu", "us", "tr"] as const;
const INPUT_CLASS =
  "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors duration-150 ease-[var(--ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

const fmt = (ms: number) =>
  new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function GovAuditLogViewer() {
  const { t } = useTranslation("admin");
  const audit = useAdminStore((s) => s.audit);
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");
  const [retentionDays, setRetentionDays] = useState(90);
  const [region, setRegion] = useState<string>("global");

  const actors = Array.from(new Set(audit.map((e) => e.actorId)));
  const rows = filterAudit(audit, {
    action: action || undefined,
    actorId: actorId || undefined,
  }) as typeof audit;

  // Self-servis saklama: kaydırıcıdan eski kayıtları gizle (Calendly farklılaştırıcısı).
  const now = Date.now();
  const visible = rows.filter(
    (e) => !retentionExpired((now - e.at) / 86_400_000, retentionDays),
  );
  const purged = rows.length - visible.length;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-ink">{t("audit2")}</h3>
        <div className="relative ml-auto">
          <Icon
            name="search"
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder={t("filterAction")}
            aria-label={t("filterAction")}
            className={`${INPUT_CLASS} w-44 pl-7`}
          />
        </div>
        <select
          value={actorId}
          onChange={(e) => setActorId(e.target.value)}
          aria-label={t("filterActor")}
          className={INPUT_CLASS}
        >
          <option value="">{t("allActors")}</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-1 text-sm text-muted">
          {t("residency")}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label={t("residency")}
            className={INPUT_CLASS}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          {t("retention")}: {retentionDays}d
          <input
            type="range"
            min={0}
            max={365}
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            aria-label={t("retention")}
            className="w-32 accent-brand"
          />
        </label>
        {purged > 0 ? (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {t("purged", { n: purged })}
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th scope="col" className="py-1.5 pr-2 font-medium">{t("col.action")}</th>
              <th scope="col" className="py-1.5 pr-2 font-medium">{t("col.actor")}</th>
              <th scope="col" className="py-1.5 pr-2 font-medium">{t("col.resource")}</th>
              <th scope="col" className="py-1.5 pr-2 font-medium">{t("col.ip")}</th>
              <th scope="col" className="py-1.5 font-medium">{t("col.time")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.id} className="border-b border-line/60 last:border-0">
                <td className="py-1.5 pr-2 text-ink">{e.action}</td>
                <td className="py-1.5 pr-2 font-mono text-[12px] text-muted">{e.actorId}</td>
                <td className="py-1.5 pr-2 text-ink-2">{e.resource}</td>
                <td className="py-1.5 pr-2 font-mono text-[12px] text-muted">{e.ip ?? "—"}</td>
                <td className="py-1.5 whitespace-nowrap text-muted">{fmt(e.at)}</td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-3 text-muted">
                  {t("noAudit")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
