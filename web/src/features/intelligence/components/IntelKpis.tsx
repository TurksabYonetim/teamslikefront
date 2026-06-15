// web/src/features/intelligence/components/IntelKpis.tsx
import { useTranslation } from "react-i18next";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineFaceSmile,
  HiOutlineQuestionMarkCircle,
  HiOutlineBolt,
  HiOutlineStar,
} from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { SCORECARDS } from "../intel.data";
import { SentimentChip, sentimentFromValue } from "./SentimentChip";

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="truncate text-xs text-muted dark:text-gray-400">{label}</div>
        <div className="text-base font-semibold text-ink dark:text-white">{children}</div>
      </div>
    </div>
  );
}

/** KPI özet satırı (Dialpad-stili scorecard metrikleri). */
export function IntelKpis() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const sc = SCORECARDS[id];
  const dash = "—";

  return (
    <div id="intel-kpis" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Stat icon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" aria-hidden />} label={t("talkRatio")}>
        {sc ? `${sc.talkRatio}%` : dash}
      </Stat>
      <Stat icon={<HiOutlineFaceSmile className="h-5 w-5" aria-hidden />} label={t("sentimentAvg")}>
        {sc ? <SentimentChip sentiment={sentimentFromValue(sc.sentiment)} /> : dash}
      </Stat>
      <Stat icon={<HiOutlineQuestionMarkCircle className="h-5 w-5" aria-hidden />} label={t("questions")}>
        {sc ? sc.questions : dash}
      </Stat>
      <Stat icon={<HiOutlineBolt className="h-5 w-5" aria-hidden />} label={`${t("pace")} (${t("wpm")})`}>
        {sc ? sc.pace : dash}
      </Stat>
      <Stat icon={<HiOutlineStar className="h-5 w-5" aria-hidden />} label={t("csat")}>
        {sc?.csat ? (
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
        )}
      </Stat>
    </div>
  );
}
