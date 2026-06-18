import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, EmptyState, Select } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { callStore, useCall } from "./callStore";
import { monitorAudio } from "./pbx";
import type { MonitorMode } from "./phone.types";
import { LINES } from "./data";
import { formatNumber } from "./routing";
import { formatDuration } from "./phone.types";

/** Operatör konsolu: tüm kuyruklardaki bekleyen çağrılar tek listede; her biri
 *  bir dahiliye hızlı transfer (mock: bekleyenlerden kaldırır). */
export function AttendantConsole() {
  const { t } = useTranslation("phone");
  const queues = usePbx((s) => s.queues);
  const monitor = useCall((s) => s.monitor);
  const extensions = LINES[0]?.extensions ?? [];
  const [target, setTarget] = useState(extensions[0]?.number ?? "");

  const waiting = queues.flatMap((q) => q.waiting.map((c) => ({ queueId: q.id, queueName: q.name, call: c })));

  // Bekleme süresi göstergesini canlı tut (çağrı varken saniyede bir).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (waiting.length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [waiting.length]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">{t("attendant.title")}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-2">{t("attendant.transferTo")}</span>
          <Select
            value={target}
            onChange={setTarget}
            options={extensions.map((ext) => ({ value: ext.number, label: `${ext.number} · ${ext.label}` }))}
            aria-label={t("attendant.selectExtension")}
            size="sm"
            className="w-56"
          />
        </div>
      </div>

      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted">
        {t("attendant.waitingCalls")}
        <span
          className={
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold " +
            (waiting.length > 0
              ? "bg-amber-100 text-amber-800 motion-safe:[animation:attendant-count_2.4s_ease-out_infinite] dark:bg-amber-900 dark:text-amber-200"
              : "bg-surface-2 text-ink-2")
          }
        >
          {waiting.length}
        </span>
      </h3>

      {waiting.length === 0 ? (
        <EmptyState title={t("attendant.empty")} description={t("attendant.noWaiting")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {waiting.map(({ queueId, queueName, call }) => (
            <li
              key={call.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{formatNumber(call.from)}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium text-ink-2">{queueName}</span>
                  <span className="tabular-nums">
                    {t("attendant.waitingFor")} {formatDuration(Math.max(0, Math.floor((now - call.since) / 1000)))}
                  </span>
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => pbxStore.getState().removeWaiting(queueId, call.id)}
                disabled={!target}
                aria-label={`${t("attendant.transfer")} ${formatNumber(call.from)} → ${target}`}
              >
                {t("attendant.transfer")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <section aria-labelledby="monitor-heading" className="rounded-lg border border-line bg-surface p-4">
        <h3 id="monitor-heading" className="mb-3 text-sm font-semibold text-muted">{t("monitor.title")}</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["listen", "whisper", "barge", "takeover"] as MonitorMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => callStore.getState().setMonitor(m)}
              aria-pressed={monitor === m}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                (monitor === m ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-2")
              }
            >
              {monitor === m && (
                <span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:[animation:attendant-dot_1.6s_ease-in-out_infinite]" aria-hidden="true" />
              )}
              {t(`monitor.${m}`)}
            </button>
          ))}
          {monitor && (
            <button type="button" onClick={() => callStore.getState().stopMonitor()} className="rounded-full px-3 py-1 text-xs font-medium text-red-600 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:underline motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-400">
              {t("monitor.stop")}
            </button>
          )}
        </div>
        {monitor && (() => {
          const a = monitorAudio(monitor);
          return (
            <ul className="text-xs text-muted">
              <li>{t("monitor.supervisorHears")}: {String(a.supervisorHearsParties)}</li>
              <li>{t("monitor.agentHears")}: {String(a.agentHearsSupervisor)}</li>
              <li>{t("monitor.customerHears")}: {String(a.customerHearsSupervisor)}</li>
            </ul>
          );
        })()}
      </section>
    </div>
  );
}
