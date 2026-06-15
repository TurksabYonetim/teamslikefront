import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Skeleton } from "@/components/ui";
import { useCallLogs } from "./phone.hooks";
import { usePbx } from "./pbxStore";
import { callLogsToCalls, computeCallStats, volumeByHour } from "./analytics";
import { estimatedWaitSec } from "./pbx";
import { formatDuration } from "./phone.types";

/** Çağrı analitiği: gerçek /v1/call-logs → callLogsToCalls → computeCallStats/
 *  volumeByHour. Yükleme=Skeleton, boş/hata=EmptyState. */
export function CallAnalytics() {
  const { t } = useTranslation("phone");
  const { data, isLoading, isError } = useCallLogs();

  const logs = useMemo(() => data ?? [], [data]);
  const calls = useMemo(() => callLogsToCalls(logs), [logs]);
  const stats = useMemo(() => computeCallStats(calls), [calls]);
  const buckets = useMemo(() => volumeByHour(calls), [calls]);
  const maxCount = useMemo(() => Math.max(1, ...buckets.map((b) => b.count)), [buckets]);
  const queues = usePbx((s) => s.queues);

  if (isLoading) {
    return (
      <div className="mx-auto grid h-full w-full max-w-4xl grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  if (isError || logs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <EmptyState title={t("analytics.empty")} description={t("analytics.emptyDescription")} />
      </div>
    );
  }

  const cards: { label: string; value: string }[] = [
    { label: t("analytics.total"), value: String(stats.total) },
    { label: t("analytics.inbound"), value: String(stats.inbound) },
    { label: t("analytics.outbound"), value: String(stats.outbound) },
    { label: t("analytics.missed"), value: String(stats.missed) },
    { label: t("analytics.missedRate"), value: `${Math.round(stats.missedRate * 100)}%` },
    { label: t("analytics.avgHandle"), value: formatDuration(stats.avgHandleSec) },
    { label: t("analytics.recorded"), value: String(stats.recorded) },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("analytics.title")}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-3 text-xs font-semibold text-muted">{t("analytics.volumeByHour")}</p>
        <div className="flex h-32 items-end gap-0.5" role="img" aria-label={t("analytics.volumeByHour")}>
          {buckets.map((b) => (
            <div key={b.hour} className="flex flex-1 flex-col items-center justify-end" title={`${b.hour}:00 — ${b.count}`}>
              <div
                className="w-full rounded-t bg-primary-500"
                style={{ height: `${(b.count / maxCount) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>0</span><span>6</span><span>12</span><span>18</span><span>23</span>
        </div>
      </div>

      {queues.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-xs font-semibold text-muted">{t("analytics.queueSla")}</p>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {queues.map((q) => {
              const est = estimatedWaitSec(q);
              const breach = est > q.maxWaitSec;
              return (
                <li key={q.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{q.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("analytics.slaTarget")}: {formatDuration(q.maxWaitSec)} · {t("analytics.estWait")}: {formatDuration(est)}
                    </p>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium " +
                      (breach
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200")
                    }
                  >
                    {breach ? t("analytics.slaBreached") : t("analytics.slaOk")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
