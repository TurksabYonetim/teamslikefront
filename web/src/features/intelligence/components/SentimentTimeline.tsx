import { useTranslation } from "react-i18next";
import { useIntel } from "../intel.store";
import { SentimentChip, sentimentFromValue } from "./SentimentChip";

const W = 300;
const H = 80;
const PAD = 8;

export function SentimentTimeline() {
  const { t } = useTranslation("intelligence");
  const sentiment = useIntel((s) => s.sentiment);
  if (sentiment.length === 0) return null;

  const n = sentiment.length;
  const x = (i: number) => PAD + (n <= 1 ? 0 : (i * (W - 2 * PAD)) / (n - 1));
  const y = (v: number) => H / 2 - v * (H / 2 - PAD);
  const points = sentiment.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-base font-semibold text-fg">{t("sentimentTimeline")}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("sentimentTimeline")}>
        <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="#e5e7eb" strokeWidth={1} />
        <polyline points={points} fill="none" stroke="#1d4ed8" strokeWidth={2} />
        {sentiment.map((p, i) => {
          const s = sentimentFromValue(p.value);
          const color = s === "positive" ? "#16a34a" : s === "negative" ? "#dc2626" : "#9ca3af";
          return <circle key={i} cx={x(i)} cy={y(p.value)} r={3.5} fill={color} />;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        <SentimentChip sentiment="positive" />
        <SentimentChip sentiment="neutral" />
        <SentimentChip sentiment="negative" />
      </div>
    </div>
  );
}
