import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EChart } from "@/components/EChart";
import { EmptyState } from "@/components/ui";
import {
  computeAnalytics,
  computeWordFrequency,
  parseSegments,
  summarizeSpeakers,
} from "./intelligence.analysis";

const STAT_DEFS = [
  { key: "words", field: "words" },
  { key: "characters", field: "characters" },
  { key: "sentences", field: "sentences" },
  { key: "lines", field: "lines" },
] as const;

/** Tek bir transkript için tüm analitik görünümü (kartlar + grafikler). */
export function TranscriptAnalyticsPanel({ content }: { content: string }) {
  const { t } = useTranslation("intelligence");

  const analytics = useMemo(() => computeAnalytics(content), [content]);
  const frequency = useMemo(() => computeWordFrequency(content), [content]);
  const speakers = useMemo(
    () => summarizeSpeakers(parseSegments(content)),
    [content],
  );

  // Frekans grafiği: yatay bar, en sık üstte.
  // (Tüm hook'lar erken return'ün ÜSTÜNDE — Rules of Hooks.)
  const freqOption = useMemo(() => {
    const items = [...frequency].reverse();
    return {
      grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f3f4f6" } },
        axisLabel: { color: "#9ca3af", fontSize: 12 },
      },
      yAxis: {
        type: "category",
        data: items.map((f) => f.word),
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#6b7280", fontSize: 12 },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: items.map((f) => f.count),
          itemStyle: { color: "#2563eb", borderRadius: [0, 4, 4, 0] },
          barWidth: "60%",
        },
      ],
    };
  }, [frequency]);

  if (!content.trim()) {
    return <EmptyState title={t("analytics.empty")} />;
  }

  return (
    <div className="space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_DEFS.map((s) => (
          <div key={s.key} className="card p-4">
            <div className="text-xs text-muted">{t(`analytics.${s.key}`)}</div>
            <div className="text-xl font-semibold text-ink tabular-nums">
              {analytics[s.field].toLocaleString()}
            </div>
          </div>
        ))}
        <div className="card p-4">
          <div className="text-xs text-muted">{t("analytics.speaking")}</div>
          <div className="text-xl font-semibold text-ink tabular-nums">
            {t("analytics.minutes", { count: analytics.speakingMinutes })}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">{t("analytics.wpm")}</div>
          <div className="text-xl font-semibold text-ink tabular-nums">
            {analytics.wpm}
          </div>
        </div>
      </div>

      {/* Kelime frekansı */}
      <div className="card p-4">
        <div className="text-sm font-medium text-ink mb-2">
          {t("analytics.frequencyTitle")}
        </div>
        {frequency.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center">
            {t("analytics.frequencyEmpty")}
          </div>
        ) : (
          <div className="w-full min-w-0 overflow-x-hidden">
            <EChart option={freqOption} height={Math.max(160, frequency.length * 26)} />
          </div>
        )}
      </div>

      {/* Konuşmacı dağılımı (segment varsa) */}
      {speakers.length > 0 && (
        <div className="card p-4">
          <div className="text-sm font-medium text-ink mb-3">
            {t("analytics.speakersTitle")}
          </div>
          <div className="space-y-3">
            {speakers.map((sp) => (
              <div key={sp.speaker}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="min-w-0 font-medium text-ink truncate">
                    {sp.speaker}
                  </span>
                  <span className="text-muted tabular-nums shrink-0 ml-2">
                    {t("analytics.speakerWords", { count: sp.words })} ·{" "}
                    {t("analytics.speakerShare", { share: sp.share })}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand motion-reduce:transition-none"
                    style={{
                      width: `${sp.share}%`,
                      transition: "width 280ms var(--ease-out)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
