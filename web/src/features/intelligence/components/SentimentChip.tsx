import { useTranslation } from "react-i18next";
import { HiOutlineFaceSmile, HiOutlineFaceFrown } from "react-icons/hi2";
import { MdSentimentNeutral } from "react-icons/md";
import clsx from "clsx";
import type { Sentiment } from "../intel.types";

const MAP: Record<Sentiment, { Icon: typeof HiOutlineFaceSmile; tone: string }> = {
  positive: { Icon: HiOutlineFaceSmile, tone: "text-green-600 dark:text-green-400" },
  neutral: { Icon: MdSentimentNeutral, tone: "text-muted dark:text-gray-400" },
  negative: { Icon: HiOutlineFaceFrown, tone: "text-red-600 dark:text-red-400" },
};

/** Sentiment is conveyed by colour + icon + label (never colour alone — AAA). */
export function SentimentChip({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  const { t } = useTranslation("intelligence");
  const { Icon, tone } = MAP[sentiment];
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs", tone, className)}>
      <Icon className="h-4 w-4" aria-hidden />
      {t(`sentiment.${sentiment}`)}
    </span>
  );
}

export function sentimentFromValue(v: number): Sentiment {
  if (v > 0.2) return "positive";
  if (v < -0.2) return "negative";
  return "neutral";
}

export function fmtClock(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}
