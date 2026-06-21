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
      className="flex w-full sm:w-80 xl:w-96 shrink-0 flex-col border-l border-line bg-surface dark:border-gray-700"
    >
      <header className="flex items-center justify-between border-b border-line p-3 dark:border-gray-700">
        <span className="text-base font-semibold text-ink">{t("engage")}</span>
        <IconButton label={t("closePanel")} onClick={() => act().setSidePanel("none")}>
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <HiOutlineChartBar className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            <h3 className="text-xs font-semibold text-ink">Anket</h3>
          </div>
          {poll ? (
            <div className="rounded-md border border-line bg-surface-2 p-2 dark:border-gray-700">
              <div className="mb-1.5 text-sm font-semibold text-ink">{poll.question}</div>
              <ul className="space-y-1">
                {poll.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(me);
                  return (
                    <li key={o.id}>
                      <button type="button" onClick={() => act().votePoll(o.id)} disabled={poll.closed} aria-pressed={mine} className={clsx("relative w-full overflow-hidden rounded-md border px-2.5 py-1.5 text-left text-sm disabled:opacity-60", mine ? "border-brand" : "border-line dark:border-gray-700")}>
                        <span className="absolute inset-y-0 left-0 bg-brand/10" style={{ width: `${pct}%` }} aria-hidden />
                        <span className="relative flex items-center gap-2">
                          {mine ? <HiOutlineCheck className="h-3.5 w-3.5 text-brand" aria-hidden /> : null}
                          <span className="flex-1 text-ink">{o.text}</span>
                          <span className="tabular-nums text-muted">{pct}%</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-1.5 flex items-center justify-between text-sm text-muted">
                <span>{t("poll.votes", { n: total })}</span>
                {isHost && !poll.closed ? <Button variant="ghost" size="sm" onClick={() => act().closeMeetingPoll()}>{t("poll.close")}</Button> : null}
              </div>
            </div>
          ) : isHost ? (
            <div className="space-y-1.5 rounded-md border border-line bg-surface-2 p-2 dark:border-gray-700">
              <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder={t("poll.questionPh")} aria-label={t("poll.questionPh")} className="input h-9" />
              {pollOpts.map((o, i) => (
                <input key={i} value={o} onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`${t("poll.option")} ${i + 1}`} aria-label={`${t("poll.option")} ${i + 1}`} className="input h-9" />
              ))}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" leftIcon={<HiOutlinePlus className="h-4 w-4" aria-hidden />} onClick={() => setPollOpts([...pollOpts, ""])}>{t("poll.addOption")}</Button>
                <Button className="ml-auto" size="sm" disabled={!pollQ.trim() || pollOpts.filter((o) => o.trim()).length < 2} onClick={() => { act().launchPoll(pollQ, pollOpts); setPollQ(""); setPollOpts(["", ""]); }}>{t("poll.launch")}</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t("poll.none")}</p>
          )}
        </section>

        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <HiOutlineQuestionMarkCircle className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            <h3 className="text-xs font-semibold text-ink">{t("qna")}</h3>
            {sortedQna.length > 0 ? <span className="ml-auto text-xs font-semibold tabular-nums text-muted">{sortedQna.length}</span> : null}
          </div>
          <div className="mb-1.5 flex items-stretch gap-2">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitQuestion(); }} placeholder={t("qnaPlaceholder")} aria-label={t("qnaPlaceholder")} className="input min-h-11 flex-1" />
            <IconButton label={t("qnaAsk")} variant="primary" disabled={!question.trim()} onClick={submitQuestion}><HiOutlinePaperAirplane className="h-[18px] w-[18px]" aria-hidden /></IconButton>
          </div>
          <ul className="space-y-1.5">
            {sortedQna.map((q) => {
              const up = q.upvotes.includes(me);
              return (
                <li key={q.id} className={clsx("rounded-md border border-line px-2 py-1.5 hover:bg-surface-2 motion-safe:transition-colors dark:border-gray-700", q.answered && "opacity-60")}>
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{q.text}</span>
                    <span className="inline-flex items-center gap-1.5">
                      {isHost && !q.answered ? <button type="button" onClick={() => act().answerQuestion(q.id)} className="rounded-md px-1.5 py-0.5 text-xs text-brand hover:bg-surface-2 focus-visible:ring-1 focus-visible:ring-brand">{t("qnaAnswer")}</button> : null}
                      <button type="button" onClick={() => act().upvoteQuestion(q.id)} aria-pressed={up} className={clsx("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs", up ? "border-brand text-brand" : "border-line text-muted dark:border-gray-700")}>
                        <HiOutlineArrowUp className="h-3 w-3" aria-hidden /> {q.upvotes.length}
                      </button>
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span className="truncate">{memberName(q.authorId)}</span>
                    {q.answered ? <span className="text-positive">{t("qnaAnswered")}</span> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <HiOutlineSparkles className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            <h3 className="text-xs font-semibold text-ink">{t("recap")}</h3>
          </div>
          <div className="flex items-stretch gap-2">
            <Button variant="secondary" size="sm" className="min-h-11 flex-1" onClick={() => setRecapOpen(true)}>{t("viewRecap")}</Button>
            <IconButton label={t("openIntelligence")} className="border border-line dark:border-gray-700" onClick={() => openIntel("src_standup")}><HiOutlineBolt className="h-4 w-4" aria-hidden /></IconButton>
          </div>
        </section>
      </div>

      <RecordingSummaryDialog open={recapOpen} onClose={() => setRecapOpen(false)} />
    </aside>
  );
}
