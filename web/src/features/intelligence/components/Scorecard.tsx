import { useTranslation } from "react-i18next";
import { HiStar, HiOutlineStar, HiOutlineSparkles } from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { SCORECARDS } from "../intel.data";
import { sentimentFromValue, fmtClock } from "./SentimentChip";

// AAA duygu rozeti: tinted zemin + koyu metin (≥7:1). Anlam kelimeyle taşınır.
const SENT_PILL: Record<string, string> = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  neutral: "bg-surface-3 text-ink-2 dark:bg-gray-700 dark:text-gray-200",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

/** Dialpad-style AI scorecard — tinted metric panels (AAA). */
export function Scorecard() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const sc = SCORECARDS[id];
  if (!sc) return null;

  const sent = sentimentFromValue(sc.sentiment);

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-base font-semibold text-ink dark:text-white">{t("scorecard")}</h3>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
          <dt className="text-xs text-muted dark:text-gray-400">{t("talkRatio")}</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink dark:text-white">{sc.talkRatio}%</dd>
        </div>
        <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
          <dt className="text-xs text-muted dark:text-gray-400">{t("sentimentAvg")}</dt>
          <dd className="mt-1">
            <span className={"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium " + SENT_PILL[sent]}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
              {t(`sentiment.${sent}`)}
            </span>
          </dd>
        </div>
        <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
          <dt className="text-xs text-muted dark:text-gray-400">{t("questions")}</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink dark:text-white">{sc.questions}</dd>
        </div>
        <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
          <dt className="text-xs text-muted dark:text-gray-400">{t("pace")}</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink dark:text-white">{t("wpm", { n: sc.pace })}</dd>
        </div>
        <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
          <dt className="text-xs text-muted dark:text-gray-400">{t("monologue")}</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink dark:text-white">{fmtClock(sc.monologueSec)}</dd>
        </div>
        {sc.csat ? (
          <div className="sc-cell rounded-md bg-surface-2 p-2.5 dark:bg-gray-700/50">
            <dt className="text-xs text-muted dark:text-gray-400">{t("csat")}</dt>
            <dd className="mt-1 flex items-center gap-0.5" aria-label={`${sc.csat} / 5`}>
              {[1, 2, 3, 4, 5].map((nn) =>
                nn <= sc.csat! ? (
                  <HiStar key={nn} className="h-4 w-4 text-amber-500" aria-hidden />
                ) : (
                  <HiOutlineStar key={nn} className="h-4 w-4 text-muted dark:text-gray-400" aria-hidden />
                ),
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      {sc.predictedCsat ? (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-900/30">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-white">
            <HiOutlineSparkles className="h-4 w-4 text-blue-800 dark:text-blue-300" aria-hidden />
            {t("predictedCsat")}
            <span className="ml-auto flex items-center gap-0.5" aria-label={`${sc.predictedCsat} / 5`}>
              {[1, 2, 3, 4, 5].map((nn) =>
                nn <= sc.predictedCsat! ? (
                  <HiStar key={nn} className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                ) : (
                  <HiOutlineStar key={nn} className="h-3.5 w-3.5 text-muted dark:text-gray-400" aria-hidden />
                ),
              )}
            </span>
          </div>
          {sc.csatReason ? <p className="mt-1 text-sm text-ink-2 dark:text-gray-300">{sc.csatReason}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
