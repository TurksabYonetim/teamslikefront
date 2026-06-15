import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, EmptyState } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { callStore, useCall } from "./callStore";
import { monitorAudio } from "./pbx";
import type { MonitorMode } from "./phone.types";
import { LINES } from "./data";
import { formatNumber } from "./routing";

/** Operatör konsolu: tüm kuyruklardaki bekleyen çağrılar tek listede; her biri
 *  bir dahiliye hızlı transfer (mock: bekleyenlerden kaldırır). */
export function AttendantConsole() {
  const { t } = useTranslation("phone");
  const queues = usePbx((s) => s.queues);
  const monitor = useCall((s) => s.monitor);
  const extensions = LINES[0]?.extensions ?? [];
  const [target, setTarget] = useState(extensions[0]?.number ?? "");

  const waiting = queues.flatMap((q) => q.waiting.map((c) => ({ queueId: q.id, queueName: q.name, call: c })));

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("attendant.title")}</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-300">{t("attendant.transferTo")}</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-label={t("attendant.selectExtension")}
            className="input"
          >
            {extensions.map((ext) => (
              <option key={ext.id} value={ext.number}>
                {ext.number} · {ext.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        {t("attendant.waitingCalls")} ({waiting.length})
      </h3>

      {waiting.length === 0 ? (
        <EmptyState title={t("attendant.empty")} description={t("attendant.noWaiting")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {waiting.map(({ queueId, queueName, call }) => (
            <li
              key={call.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{formatNumber(call.from)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{queueName}</p>
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
      <section aria-labelledby="monitor-heading" className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 id="monitor-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{t("monitor.title")}</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["listen", "whisper", "barge", "takeover"] as MonitorMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => callStore.getState().setMonitor(m)}
              aria-pressed={monitor === m}
              className={
                "rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                (monitor === m ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300")
              }
            >
              {t(`monitor.${m}`)}
            </button>
          ))}
          {monitor && (
            <button type="button" onClick={() => callStore.getState().stopMonitor()} className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-400">
              {t("monitor.stop")}
            </button>
          )}
        </div>
        {monitor && (() => {
          const a = monitorAudio(monitor);
          return (
            <ul className="text-xs text-gray-600 dark:text-gray-300">
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
