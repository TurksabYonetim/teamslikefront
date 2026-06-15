import { useTranslation } from "react-i18next";
import { HiStar, HiOutlineStar, HiOutlineSparkles } from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { SCORECARDS } from "../intel.data";
import { SentimentChip, sentimentFromValue, fmtClock } from "./SentimentChip";

/** Dialpad-style AI scorecard. */
export function Scorecard() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const sc = SCORECARDS[id];
  if (!sc) return null;

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-base font-semibold text-ink dark:text-white">{t("scorecard")}</h3>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-muted dark:text-gray-400">{t("talkRatio")}</dt>
          <dd className="text-base font-semibold text-ink dark:text-white">{sc.talkRatio}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted dark:text-gray-400">{t("sentimentAvg")}</dt>
          <dd className="text-base font-semibold">
            <SentimentChip sentiment={sentimentFromValue(sc.sentiment)} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted dark:text-gray-400">{t("questions")}</dt>
          <dd className="text-base font-semibold text-ink dark:text-white">{sc.questions}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted dark:text-gray-400">{t("pace")}</dt>
          <dd className="text-base font-semibold text-ink dark:text-white">
            {sc.pace} {t("wpm")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted dark:text-gray-400">{t("monologue")}</dt>
          <dd className="text-base font-semibold text-ink dark:text-white">{fmtClock(sc.monologueSec)}</dd>
        </div>
        {sc.csat ? (
          <div>
            <dt className="text-xs text-muted dark:text-gray-400">{t("csat")}</dt>
            <dd className="flex items-center gap-0.5" aria-label={`${sc.csat} / 5`}>
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
        <div className="mt-3 rounded-md border border-line bg-surface-2 p-2 dark:border-gray-700 dark:bg-gray-700">
          <div className="flex items-center gap-1 text-sm font-semibold text-ink dark:text-white">
            <HiOutlineSparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
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
          {sc.csatReason ? <p className="mt-1 text-sm text-muted dark:text-gray-400">{sc.csatReason}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
