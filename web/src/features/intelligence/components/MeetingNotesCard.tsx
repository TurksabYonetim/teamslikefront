import { useTranslation } from "react-i18next";
import { HiOutlineTag, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { MdGraphicEq } from "react-icons/md";
import { useIntel } from "../intel.store";
import { TRANSCRIPTS } from "../intel.data";
import { speakerStats, topKeywords, actionItems, type SpeakerStat } from "../intel.notes";
import { memberName } from "@/features/messaging/members";

/**
 * notta/otter-style meeting notes (Faz 4): speaker diarization + words-per-minute,
 * keyword extraction and auto action items, computed live from the transcript.
 */
export function MeetingNotesCard() {
  const { t } = useTranslation("intelligence");
  const sourceId = useIntel((s) => s.activeSourceId);
  const segs = TRANSCRIPTS[sourceId] ?? [];
  if (segs.length === 0) return null;

  const stats = speakerStats(segs);
  const maxWpm = Math.max(1, ...stats.map((s) => s.wpm));
  const keywords = topKeywords(segs);
  const actions = actionItems(segs);
  const nameOf = (st: SpeakerStat) => (st.name !== st.speakerId ? st.name : memberName(st.speakerId));

  return (
    <div className="mnotes rounded-card border border-line bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-ink dark:text-white">
        <MdGraphicEq size={18} className="shrink-0" aria-hidden /> {t("notes.title")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <section>
          <h4 className="mb-1 text-sm font-semibold text-muted">{t("notes.wpm")}</h4>
          <ul className="mnotes-list">
            {stats.map((st) => (
              <li key={st.speakerId} className="mnotes-item">
                <div className="flex items-center justify-between gap-2 text-sm text-ink dark:text-white">
                  <span className="min-w-0 truncate">{nameOf(st)}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {st.wpm} {t("notes.wpmUnit")}
                  </span>
                </div>
                <div className="mnotes-track mt-0.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="mnotes-fill h-full rounded-full bg-blue-700 dark:bg-blue-400"
                    style={{ ["--w" as string]: `${(st.wpm / maxWpm) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-muted">
            <HiOutlineTag size={14} aria-hidden /> {t("notes.keywords")}
          </h4>
          <div className="flex flex-wrap gap-1">
            {keywords.map((k) => (
              <span
                key={k.word}
                className="mnotes-chip rounded-full border border-line px-2 py-0.5 text-xs text-ink dark:border-gray-700 dark:text-white"
              >
                {k.word} <span className="text-muted">{k.count}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-muted">
            <HiOutlineClipboardDocumentCheck size={14} aria-hidden /> {t("notes.actions")}
          </h4>
          {actions.length > 0 ? (
            <ul className="ml-4 list-disc space-y-1 text-sm text-ink dark:text-white">
              {actions.map((a, i) => (
                <li key={i} className="mnotes-act break-words">
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("notes.noActions")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
