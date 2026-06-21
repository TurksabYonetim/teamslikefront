import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineXMark,
  HiOutlineChartBar,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowUp,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineBolt,
} from "react-icons/hi2";
import clsx from "clsx";
import { useMeeting, meetingStore } from "../meetings.store";
import { ME_ID, memberName } from "@/features/messaging/members";
import { useOpenIntelligence } from "@/features/integration";
import { Button, IconButton } from "@/components/ui";
import { RecordingSummaryDialog } from "./RecordingSummaryDialog";

const act = () => meetingStore.getState();
const me = ME_ID;

function SectionHeader({ icon, title, trailing }: { icon: React.ReactNode; title: string; trailing?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <span className="shrink-0 text-brand">{icon}</span>
      <h3 className="text-[0.8125rem] font-semibold text-ink">{title}</h3>
      {trailing ? <span className="ml-auto">{trailing}</span> : null}
    </div>
  );
}

/** Engage: live poll (host launch / vote / %), Q&A (ask / upvote / answer), recap. */
export function EngagePanel() {
  const { t } = useTranslation("meetings");
  const openIntel = useOpenIntelligence();
  const sidePanel = useMeeting((s) => s.sidePanel);
  const poll = useMeeting((s) => s.meetingPoll);
  const qna = useMeeting((s) => s.qna);
  const participants = useMeeting((s) => s.participants);

  const self = participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  const [recapOpen, setRecapOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [pollQ, setPollQ] = React.useState("");
  const [pollOpts, setPollOpts] = React.useState(["", ""]);

  if (sidePanel !== "engage") return null;

  const total = poll ? poll.options.reduce((n, o) => n + o.votes.length, 0) : 0;
  const sortedQna = qna.slice().sort((a, b) => b.upvotes.length - a.upvotes.length);

  const submitQuestion = () => {
    if (!question.trim()) return;
    act().askQuestion(question);
    setQuestion("");
  };

  return (
    <aside
      aria-label={t("engage")}
      className="absolute inset-0 z-30 flex w-full shrink-0 flex-col border-l border-line bg-surface dark:border-gray-700 sm:static sm:inset-auto sm:z-auto sm:w-80 xl:w-96"
    >
      <header className="flex items-center justify-between border-b border-line px-3 py-2 dark:border-gray-700">
        <span className="text-sm font-semibold text-ink">{t("engage")}</span>
        <IconButton label={t("closePanel")} onClick={() => act().setSidePanel("none")}>
          <HiOutlineXMark className="h-[18px] w-[18px]" aria-hidden />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2.5">
        <section>
          <SectionHeader icon={<HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden />} title={t("poll.title")} />
          {poll ? (
            <div className="rounded-lg border border-line bg-surface-2 p-2.5 dark:border-gray-700">
              <div className="mb-2 text-sm font-semibold leading-snug text-ink">{poll.question}</div>
              <ul className="space-y-1">
                {poll.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(me);
                  return (
                    <li key={o.id}>
                      <button type="button" onClick={() => act().votePoll(o.id)} disabled={poll.closed} aria-pressed={mine} className={clsx("relative w-full overflow-hidden rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors disabled:cursor-default disabled:opacity-70", mine ? "border-brand bg-brand/5" : "border-line hover:bg-surface-3 dark:border-gray-700")}>
                        <span className="absolute inset-y-0 left-0 bg-brand/10" style={{ width: `${pct}%` }} aria-hidden />
                        <span className="relative flex items-center gap-2">
                          {mine ? <HiOutlineCheck className="h-4 w-4 shrink-0 text-brand" aria-hidden /> : null}
                          <span className="min-w-0 flex-1 break-words text-ink">{o.text}</span>
                          <span className="shrink-0 font-semibold tabular-nums text-ink-2">{pct}%</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2.5 flex items-center justify-between text-xs text-muted">
                <span>{t("poll.votes", { n: total })}</span>
                {isHost && !poll.closed ? <Button variant="ghost" size="sm" onClick={() => act().closeMeetingPoll()}>{t("poll.close")}</Button> : null}
              </div>
            </div>
          ) : isHost ? (
            <div className="space-y-1.5 rounded-lg border border-line bg-surface-2 p-2.5 dark:border-gray-700">
              <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder={t("poll.questionPh")} aria-label={t("poll.questionPh")} className="input h-9" />
              {pollOpts.map((o, i) => (
                <input key={i} value={o} onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`${t("poll.option")} ${i + 1}`} aria-label={`${t("poll.option")} ${i + 1}`} className="input h-9" />
              ))}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <Button variant="ghost" size="sm" leftIcon={<HiOutlinePlus className="h-4 w-4" aria-hidden />} onClick={() => setPollOpts([...pollOpts, ""])}>{t("poll.addOption")}</Button>
                <Button className="ml-auto" size="sm" disabled={!pollQ.trim() || pollOpts.filter((o) => o.trim()).length < 2} onClick={() => { act().launchPoll(pollQ, pollOpts); setPollQ(""); setPollOpts(["", ""]); }}>{t("poll.launch")}</Button>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-sm text-muted dark:border-gray-700">{t("poll.none")}</p>
          )}
        </section>

        <section>
          <SectionHeader
            icon={<HiOutlineQuestionMarkCircle className="h-3.5 w-3.5" aria-hidden />}
            title={t("qna")}
            trailing={sortedQna.length > 0 ? <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface-3 px-1.5 text-[0.6875rem] font-semibold tabular-nums text-ink-2 dark:bg-gray-700">{sortedQna.length}</span> : null}
          />
          <div className="mb-1.5 flex items-stretch gap-1.5">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitQuestion(); }} placeholder={t("qnaPlaceholder")} aria-label={t("qnaPlaceholder")} className="input h-9 flex-1" />
            <IconButton label={t("qnaAsk")} variant="primary" disabled={!question.trim()} onClick={submitQuestion}><HiOutlinePaperAirplane className="h-[18px] w-[18px]" aria-hidden /></IconButton>
          </div>
          {sortedQna.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-sm text-muted dark:border-gray-700">{t("qnaEmpty", { defaultValue: t("poll.none") })}</p>
          ) : (
            <ul className="space-y-1.5">
              {sortedQna.map((q) => {
                const up = q.upvotes.includes(me);
                return (
                  <li key={q.id} className={clsx("rounded-lg border border-line p-2 motion-safe:transition-colors dark:border-gray-700", q.answered ? "bg-surface-2 opacity-75" : "hover:bg-surface-2")}>
                    <p className="break-words text-[0.8125rem] leading-snug text-ink">{q.text}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-muted">{memberName(q.authorId)}</span>
                      {q.answered ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-positive">
                          <HiOutlineCheck className="h-3.5 w-3.5" aria-hidden /> {t("qnaAnswered")}
                        </span>
                      ) : isHost ? (
                        <button type="button" onClick={() => act().answerQuestion(q.id)} className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{t("qnaAnswer")}</button>
                      ) : null}
                      <button type="button" onClick={() => act().upvoteQuestion(q.id)} aria-pressed={up} aria-label={t("qnaUpvote", { defaultValue: "Oy ver" })} className={clsx("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", up ? "border-brand bg-brand/5 text-brand" : "border-line text-muted hover:bg-surface-3 dark:border-gray-700")}>
                        <HiOutlineArrowUp className="h-3.5 w-3.5" aria-hidden /> {q.upvotes.length}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader icon={<HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden />} title={t("recap")} />
          <div className="flex items-stretch gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setRecapOpen(true)}>{t("viewRecap")}</Button>
            <IconButton label={t("openIntelligence")} className="border border-line dark:border-gray-700" onClick={() => openIntel("src_standup")}><HiOutlineBolt className="h-4 w-4" aria-hidden /></IconButton>
          </div>
        </section>
      </div>

      <RecordingSummaryDialog open={recapOpen} onClose={() => setRecapOpen(false)} />
    </aside>
  );
}
