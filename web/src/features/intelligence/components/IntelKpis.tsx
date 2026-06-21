// web/src/features/intelligence/components/IntelKpis.tsx
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineStar } from "react-icons/hi2";
import clsx from "clsx";
import { useIntel } from "../intel.store";
import { SCORECARDS } from "../intel.data";
import { SentimentChip, sentimentFromValue } from "./SentimentChip";

/** Normalise a short series to a 0–100 × 0–26 polyline (oldest→newest, y inverted). */
function sparkPoints(series: number[], w = 100, h = 26, pad = 4): string {
  if (series.length < 2) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const stepX = w / (series.length - 1);
  return series
    .map((v, i) => {
      const x = +(i * stepX).toFixed(1);
      const y = +(h - pad - ((v - min) / span) * (h - pad * 2)).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");
}

function Stat({
  label,
  value,
  trend,
  fmtDelta,
}: {
  label: string;
  value: ReactNode;
  trend?: number[];
  fmtDelta?: (d: number) => string;
}) {
  const delta = trend && trend.length >= 2 ? trend[trend.length - 1] - trend[0] : null;

  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-white p-2.5 transition-shadow duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted dark:text-gray-400">{label}</span>
        {delta !== null && delta !== 0 && fmtDelta ? (
          <span
            className={clsx(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
              delta > 0
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-surface-3 text-ink-3 dark:bg-gray-700 dark:text-gray-300",
            )}
          >
            <span aria-hidden>{delta > 0 ? "▲" : "▼"}</span>
            {fmtDelta(delta)}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 truncate text-lg font-semibold tabular-nums text-ink sm:text-xl dark:text-white">{value}</div>

      {trend && trend.length >= 2 ? (
        <svg className="kpi-spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={sparkPoints(trend)} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
    </div>
  );
}

/** KPI özet satırı (Dialpad-stili scorecard metrikleri + metrik-başı trend). */
export function IntelKpis() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const sc = SCORECARDS[id];
  const tr = sc?.trends;
  const dash = "—";

  return (
    <div id="intel-kpis" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Stat
        label={t("talkRatio")}
        value={sc ? `${sc.talkRatio}%` : dash}
        trend={tr?.talkRatio}
        fmtDelta={(d) => `${Math.round(Math.abs(d))}%`}
      />
      <Stat
        label={t("sentimentAvg")}
        value={sc ? <SentimentChip sentiment={sentimentFromValue(sc.sentiment)} /> : dash}
        trend={tr?.sentiment}
        fmtDelta={(d) => Math.abs(d).toFixed(2)}
      />
      <Stat
        label={t("questions")}
        value={sc ? sc.questions : dash}
        trend={tr?.questions}
        fmtDelta={(d) => `${Math.round(Math.abs(d))}`}
      />
      <Stat
        label={t("pace")}
        value={sc ? t("wpm", { n: sc.pace }) : dash}
        trend={tr?.pace}
        fmtDelta={(d) => `${Math.round(Math.abs(d))}`}
      />
      <Stat
        label={t("csat")}
        value={
          sc?.csat ? (
            <span className="inline-flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <HiOutlineStar
                  key={n}
                  className={"h-4 w-4 " + (n <= (sc.csat ?? 0) ? "text-amber-400" : "text-line dark:text-gray-600")}
                  aria-hidden
                />
              ))}
            </span>
          ) : (
            dash
          )
        }
      />
    </div>
  );
}
