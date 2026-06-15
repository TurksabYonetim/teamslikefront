import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import clsx from "clsx";
import { useAdminStore } from "../governance.store";
import { quotaState, type QuotaLevel } from "../admin.governance";

const LEVEL: Record<QuotaLevel, { icon: string; tone: "positive" | "warning" | "danger"; bar: string }> = {
  ok: { icon: "checkCircle", tone: "positive", bar: "bg-green-500" },
  warn: { icon: "warning", tone: "warning", bar: "bg-amber-500" },
  exceeded: { icon: "alert", tone: "danger", bar: "bg-red-500" },
};

export function GovOverviewDashboard() {
  const { t } = useTranslation("admin");
  const quotas = useAdminStore((s) => s.quotas);
  const billing = useAdminStore((s) => s.billing);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
        <span className="text-sm text-muted">{t("plan")}</span>
        <Badge tone="accent">{t(`planName.${billing.plan}`)}</Badge>
        <span className="text-sm text-muted">{t("seats", { n: billing.seats })}</span>
        <Badge tone="positive">{t(`billingStatus.${billing.status}`)}</Badge>
      </div>

      <div className="tl-stagger grid gap-3 sm:grid-cols-3">
        {quotas.map((q) => {
          const level = quotaState(q.used, q.limit);
          const { icon, tone, bar } = LEVEL[level];
          const pct = q.limit > 0 ? Math.round((q.used / q.limit) * 100) : 0;
          return (
            <div key={q.key} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex-1 text-sm font-medium text-ink">{t(`quotaKey.${q.key}`, q.key)}</span>
                <Badge tone={tone}>
                  <Icon name={icon} className="h-3 w-3" /> {t(`quota.${level}`)}
                </Badge>
              </div>
              <div className="text-sm text-muted">
                {q.used} / {q.limit}
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={Math.min(100, pct)} aria-valuemin={0} aria-valuemax={100} aria-label={t(`quotaKey.${q.key}`, q.key)}>
                <div
                  className={clsx("h-full transition-[width] duration-[var(--dur-modal)] ease-[var(--ease-out)]", bar)}
                  style={{ width: `${Math.min(100, pct)}%` }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
