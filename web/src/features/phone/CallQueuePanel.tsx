import { useTranslation } from "react-i18next";
import { HiOutlineArrowsRightLeft, HiOutlineClock, HiOutlineCheckCircle, HiOutlinePhoneArrowUpRight } from "react-icons/hi2";
import clsx from "clsx";
import { Badge, Button, EmptyState } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { estimatedWaitSec } from "./pbx";
import { formatNumber } from "./routing";
import { formatDuration } from "./phone.types";

/** İki kelimeye kadar baş harflerden monogram (temsilci avatarı). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0] ?? "").join("") || name.slice(0, 2)).toLocaleUpperCase("tr");
}

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
    <div className="call-queue-panel mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-3 sm:p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">{t("queues.title")}</h2>
      {queues.map((q) => (
        <section key={q.id} aria-labelledby={`queue-heading-${q.id}`} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 id={`queue-heading-${q.id}`} className="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-white">{q.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge><HiOutlineArrowsRightLeft size={13} aria-hidden className="-ml-0.5 mr-1 inline-block align-text-bottom" />{t("queues.strategy")}: {t(`enums.strategy.${q.strategy}`)}</Badge>
              <Badge><HiOutlineClock size={13} aria-hidden className="-ml-0.5 mr-1 inline-block align-text-bottom" />{t("queues.estWait")}: {formatDuration(estimatedWaitSec(q))}</Badge>
            </div>
          </div>

          <p className="mb-1 text-xs font-semibold text-muted">{t("queues.agents")}</p>
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
            {q.agents.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2">
                <span
                  className={"cq-agent-avatar " + (a.available ? "is-available" : "is-away")}
                  aria-hidden="true"
                >
                  {initials(a.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                  <p className="truncate text-xs tabular-nums text-muted">{formatDuration(a.idleSec)} {t("queues.idle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pbxStore.getState().toggleAgentAvailable(q.id, a.id)}
                  aria-pressed={a.available}
                  aria-label={`${a.name}: ${a.available ? t("queues.available") : t("queues.unavailable")}`}
                  className={clsx(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    a.available
                      ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-200"
                      : "bg-surface-2 text-ink-3 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300",
                  )}
                >
                  <span
                    className={clsx("h-1.5 w-1.5 rounded-full", a.available ? "bg-green-500" : "bg-gray-400")}
                    aria-hidden="true"
                  />
                  {a.available ? t("queues.available") : t("queues.unavailable")}
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-semibold text-muted">
              {t("queues.waiting")} ({q.waiting.length})
            </p>
            <Button size="sm" className="shrink-0" onClick={() => pbxStore.getState().assignNext(q.id)} disabled={q.waiting.length === 0}>
              {t("queues.assignNext")}
            </Button>
          </div>
          {q.waiting.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <HiOutlineCheckCircle className="cq-calm-illus" size={40} aria-hidden />
              <p className="text-sm font-medium text-ink">{t("queues.calm")}</p>
              <p className="text-xs text-muted dark:text-gray-400">{t("queues.noWaiting")}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {q.waiting.map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-700/50"
                >
                  <span
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-ink-3 dark:bg-gray-800 dark:text-gray-300"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium tabular-nums text-ink">{formatNumber(c.from)}</p>
                  {c.callbackRequested ? (
                    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-green-700 dark:text-green-300">
                      <HiOutlineCheckCircle size={15} aria-hidden />
                      <span className="hidden sm:inline">{t("queues.callbackRequested")}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pbxStore.getState().requestCallback(q.id, c.id)}
                      aria-label={`${t("queues.requestCallback")} — ${formatNumber(c.from)}`}
                      className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-brand transition-colors hover:bg-brand-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <HiOutlinePhoneArrowUpRight size={15} aria-hidden />
                      <span className="hidden sm:inline">{t("queues.requestCallback")}</span>
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
