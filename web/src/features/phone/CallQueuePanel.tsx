import { useTranslation } from "react-i18next";
import { Badge, Button, EmptyState } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { estimatedWaitSec } from "./pbx";
import { formatNumber } from "./routing";
import { formatDuration } from "./phone.types";

/** Çağrı kuyrukları: ring stratejisi, ajan durumu (uygunluk toggle), SLA/bekleme
 *  tahmini (estimatedWaitSec), bekleyen çağrılar + sonrakini ata / geri arama iste. */
export function CallQueuePanel() {
  const { t } = useTranslation("phone");
  const queues = usePbx((s) => s.queues);

  if (queues.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <EmptyState title={t("queues.title")} description={t("queues.empty")} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("queues.title")}</h2>
      {queues.map((q) => (
        <section key={q.id} aria-labelledby={`queue-heading-${q.id}`} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 id={`queue-heading-${q.id}`} className="text-lg font-semibold text-gray-900 dark:text-white">{q.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Badge>{t("queues.strategy")}: {t(`enums.strategy.${q.strategy}`)}</Badge>
              <Badge>{t("queues.estWait")}: {formatDuration(estimatedWaitSec(q))}</Badge>
            </div>
          </div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("queues.agents")}</p>
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
            {q.agents.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(a.idleSec)} {t("queues.idle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pbxStore.getState().toggleAgentAvailable(q.id, a.id)}
                  aria-pressed={a.available}
                  aria-label={`${a.name}: ${a.available ? t("queues.available") : t("queues.unavailable")}`}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                    (a.available
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300")
                  }
                >
                  {a.available ? t("queues.available") : t("queues.unavailable")}
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("queues.waiting")} ({q.waiting.length})
            </p>
            <Button size="sm" onClick={() => pbxStore.getState().assignNext(q.id)} disabled={q.waiting.length === 0}>
              {t("queues.assignNext")}
            </Button>
          </div>
          {q.waiting.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("queues.noWaiting")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {q.waiting.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                  <span className="text-sm text-gray-900 dark:text-white">{formatNumber(c.from)}</span>
                  {c.callbackRequested ? (
                    <Badge>{t("queues.callbackRequested")}</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pbxStore.getState().requestCallback(q.id, c.id)}
                      aria-label={`${t("queues.requestCallback")} — ${formatNumber(c.from)}`}
                      className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {t("queues.requestCallback")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
