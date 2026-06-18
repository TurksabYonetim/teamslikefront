// web/src/features/support/components/WorkforceView.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { wfoStore, useWfoStore } from "../wfo.store";
import { adherence as adherenceRatio, scorecardTotal, staffingGap, understaffed, serviceLevel } from "../wfo.dom";
import { AGENTS } from "../support.data";
import { Card } from "./Card";

const agentName = (id: string) => AGENTS.find((a) => a.id === id)?.name ?? id;

/** WFO/WEM: tahmin → vardiya, uyum göstergeleri, kalite skorkartı. */
export function WorkforceView() {
  const { t } = useTranslation("support");
  const intervals = useWfoStore((s) => s.intervals);
  const adherenceRows = useWfoStore((s) => s.adherence);
  const criteria = useWfoStore((s) => s.criteria);
  const evaluations = useWfoStore((s) => s.evaluations);
  const act = wfoStore.getState;

  const gaps = understaffed(intervals);
  const sl = Math.round(serviceLevel(intervals) * 100);

  const [agentId, setAgentId] = useState(AGENTS[0]?.id ?? "");
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(criteria.map((c) => [c.id, 3])));
  const liveTotal = scorecardTotal(scores, criteria);

  return (
    <div className="tl-stagger grid flex-1 gap-4 overflow-y-auto pb-4 lg:grid-cols-2">
      {/* Tahmin & personel */}
      <Card className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Icon name="chartBar" className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold text-ink">{t("wfo.forecast")}</h2>
          <Badge tone={sl >= 90 ? "positive" : sl >= 75 ? "warning" : "danger"}>{t("wfo.serviceLevel", { n: sl })}</Badge>
          {gaps.length > 0 ? (
            <Badge tone="warning">
              <Icon name="bolt" className="h-3.5 w-3.5" aria-hidden /> {t("wfo.understaffed", { n: gaps.length })}
            </Badge>
          ) : null}
          <Button size="sm" variant="secondary" className="ml-auto" onClick={() => act().regenerateForecast()}>
            <Icon name="reschedule" className="h-4 w-4" aria-hidden /> {t("wfo.regenerate")}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-sm text-muted">
                <th className="border-b border-line px-2 py-1 font-semibold">{t("wfo.interval")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("wfo.volume")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("wfo.required")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("wfo.scheduled")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("wfo.gap")}</th>
                <th className="border-b border-line px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {intervals.map((i) => {
                const gap = staffingGap(i);
                const tone = gap < 0 ? "danger" : gap === 0 ? "neutral" : "positive";
                return (
                  <tr key={i.id}>
                    <td className="border-b border-line px-2 py-1 text-ink">{i.label}</td>
                    <td className="border-b border-line px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        value={i.forecastVolume}
                        onChange={(e) => act().setVolume(i.id, Number(e.target.value))}
                        aria-label={`${i.label} ${t("wfo.volume")}`}
                        className="input w-20"
                      />
                    </td>
                    <td className="border-b border-line px-2 py-1 text-ink">{i.required}</td>
                    <td className="border-b border-line px-2 py-1 text-ink">{i.scheduled}</td>
                    <td className="border-b border-line px-2 py-1">
                      <Badge tone={tone}>{gap > 0 ? `+${gap}` : gap}</Badge>
                    </td>
                    <td className="border-b border-line px-2 py-1 text-right">
                      {gap < 0 ? (
                        <Button size="sm" variant="secondary" onClick={() => act().bumpScheduled(i.id)}>
                          <Icon name="plus" className="h-4 w-4" aria-hidden /> {t("wfo.selfHeal")}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Uyum */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="chartBar" className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold text-ink">{t("wfo.adherence")}</h2>
        </div>
        <ul className="space-y-3">
          {adherenceRows.map((row) => {
            const pct = Math.round(adherenceRatio(row.scheduledMin, row.adherentMin) * 100);
            const color = pct >= 90 ? "bg-green-500" : pct >= 80 ? "bg-amber-500" : "bg-red-500";
            const text = pct >= 90 ? "text-green-600 dark:text-green-400" : pct >= 80 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
            return (
              <li key={row.agentId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink">{agentName(row.agentId)}</span>
                  <span className={clsx("font-medium tabular-nums", text)}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={clsx("h-full w-full origin-left transition-transform duration-200 ease-[var(--ease-out,ease-out)] motion-reduce:transition-none", color)}
                    style={{ transform: `scaleX(${pct / 100})` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Kalite skorkartı */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="clipboard" className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold text-ink">{t("wfo.quality")}</h2>
        </div>

        <div className="mb-3 space-y-2">
          <Select
            id="wfo-agent"
            value={agentId}
            onChange={setAgentId}
            label={t("wfo.agent")}
            options={AGENTS.map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />

          {criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-ink">
                {c.label} <span className="text-muted">×{c.weight}</span>
              </span>
              <Select
                value={String(scores[c.id] ?? 0)}
                onChange={(v) => setScores((s) => ({ ...s, [c.id]: Number(v) }))}
                aria-label={c.label}
                options={[0, 1, 2, 3, 4, 5].map((n) => ({
                  value: String(n),
                  label: String(n),
                }))}
                size="sm"
                className="w-20"
              />
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Badge tone="accent">
              {t("wfo.total")}: {liveTotal}
            </Badge>
            <Button size="sm" className="ml-auto" onClick={() => act().addEvaluation(agentId, "cv1", scores)}>
              <Icon name="plus" className="h-4 w-4" aria-hidden /> {t("wfo.saveScore")}
            </Button>
          </div>
        </div>

        <h3 className="mb-1 text-sm font-semibold text-ink">{t("wfo.evaluations")}</h3>
        <ul className="space-y-1">
          {evaluations.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
              <span className="text-ink">{agentName(ev.agentId)}</span>
              <span className="text-muted">· {ev.conversationId}</span>
              <Badge tone="positive" className="ml-auto">
                {scorecardTotal(ev.scores, criteria)}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
