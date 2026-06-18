import { useTranslation } from "react-i18next";
import { useIntel } from "../intel.store";
import { SentimentChip } from "./SentimentChip";
import { EChart } from "@/components/EChart";

/**
 * Sentiment over the session. The line is coloured along its length by value
 * (red → grey → green via visualMap); axes use AAA grey, brand-neutral chart.
 */
export function SentimentTimeline() {
  const { t } = useTranslation("intelligence");
  const sentiment = useIntel((s) => s.sentiment);
  if (sentiment.length === 0) return null;

  const option = {
    textStyle: { fontFamily: "Inter, system-ui, sans-serif" },
    grid: { left: 28, right: 10, top: 14, bottom: 22 },
    tooltip: {
      trigger: "axis",
      formatter: (ps: { data: number }[]) => {
        const v = ps[0].data;
        const s = v > 0.2 ? t("sentiment.positive") : v < -0.2 ? t("sentiment.negative") : t("sentiment.neutral");
        return `${s} · ${Number(v).toFixed(2)}`;
      },
    },
    visualMap: {
      show: false,
      type: "continuous",
      min: -1,
      max: 1,
      dimension: 1,
      inRange: { color: ["#dc2626", "#9ca3af", "#16a34a"] },
    },
    xAxis: {
      type: "category",
      data: sentiment.map((_, i) => String(i + 1)),
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#4b5563", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      min: -1,
      max: 1,
      interval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
      axisLabel: { color: "#4b5563", fontSize: 10 },
    },
    series: [
      {
        type: "line",
        data: sentiment.map((p) => p.value),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
    ],
  };

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-ink dark:text-white">{t("sentimentTimeline")}</h3>
      <EChart height={180} option={option} />
      <div className="mt-2 flex flex-wrap gap-3">
        <SentimentChip sentiment="positive" />
        <SentimentChip sentiment="neutral" />
        <SentimentChip sentiment="negative" />
      </div>
    </div>
  );
}
