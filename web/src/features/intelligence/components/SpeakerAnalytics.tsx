import { useTranslation } from "react-i18next";
import { useIntel } from "../intel.store";
import { SPEAKER_STATS } from "../intel.data";
import { memberName } from "@/features/messaging/members";
import { sentimentFromValue } from "./SentimentChip";

// AAA duygu rozeti: tinted zemin + koyu metin (≥7:1). Anlam kelimeyle taşınır.
const SENT_PILL: Record<string, string> = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  neutral: "bg-surface-3 text-ink-2 dark:bg-gray-700 dark:text-gray-200",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

/** Per-speaker talk-time, sentiment, interruptions and filler words (Dialpad/Zoom).
 *  Compact AAA rows: name + talk-share bar + percent + sentiment. */
export function SpeakerAnalytics() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const stats = SPEAKER_STATS[id] ?? [];
  const total = stats.reduce((n, s) => n + s.talkSec, 0) || 1;

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-base font-semibold text-ink dark:text-white">{t("speakers")}</h3>
      <ul className="flex flex-col gap-1">
        {stats.map((s) => {
          const pct = Math.round((s.talkSec / total) * 100);
          const name = s.name ?? memberName(s.speakerId);
          const sent = sentimentFromValue(s.sentiment);
          return (
            <li key={s.speakerId} className="sa-row -mx-1.5 flex items-center gap-2.5 rounded px-1.5 py-1">
              <span className="w-24 shrink-0 truncate text-sm font-medium text-ink dark:text-white">{name}</span>
              <span
                className="h-2 flex-1 overflow-hidden rounded-full bg-line dark:bg-gray-700"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={name}
              >
                <span className="sa-fill block h-full rounded-full bg-brand" style={{ ["--w" as string]: `${pct}%` }} />
              </span>
              <span className="w-9 shrink-0 text-right text-sm font-semibold tabular-nums text-ink dark:text-white">{pct}%</span>
              <span className={"inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium " + SENT_PILL[sent]}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
                {t(`sentiment.${sent}`)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
