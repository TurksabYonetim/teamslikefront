import { useTranslation } from "react-i18next";
import { HiOutlineChartBar, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import clsx from "clsx";
import { messagingStore, useMessaging } from "../store";
import { ME_ID } from "../members";
import { Button } from "@/components/ui";
import type { Message } from "../types";

/** Anket / quiz mesajı (Telegram/WhatsApp/Teams/Zoom/Meet). */
export function PollMessage({ message }: { message: Message }) {
  const { t } = useTranslation("messaging");
  const { vote, closePoll } = messagingStore.getState();

  // Oy verince güncel state'i yansıtmak için store'dan canlı mesajı oku.
  const live = useMessaging((s) => s.messages.find((m) => m.id === message.id));
  const current = live ?? message;
  const poll = current.poll!;
  if (!poll) return null;

  const total = poll.options.reduce((n, o) => n + o.votes.length, 0);
  const owner = current.authorId === ME_ID;

  const typeLabel = poll.quiz
    ? t("poll.quiz")
    : poll.anonymous
      ? t("poll.anonymous")
      : t("poll.public");

  return (
    <div className="max-w-md rounded-lg border border-line bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted">
        <HiOutlineChartBar className="h-4 w-4" aria-hidden />
        {typeLabel}
        {poll.multi ? ` · ${t("poll.multi")}` : ""}
        {poll.closed ? ` · ${t("poll.closed")}` : ""}
      </div>
      <div className="mb-2 text-sm font-semibold text-ink dark:text-white">{poll.question}</div>

      <ul className="space-y-1.5">
        {poll.options.map((o) => {
          const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
          const mine = o.votes.includes(ME_ID);
          const isCorrect = poll.quiz && poll.closed && poll.correctOptionId === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => vote(current.id, o.id, ME_ID)}
                disabled={poll.closed}
                aria-pressed={mine}
                className={clsx(
                  "relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm",
                  mine ? "border-brand" : "border-line dark:border-gray-700",
                  poll.closed ? "cursor-default" : "hover:border-brand",
                )}
              >
                <span
                  className={clsx("absolute inset-y-0 start-0", isCorrect ? "bg-green-500/25" : "bg-surface-2")}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <span className="relative flex items-center gap-2">
                  {mine ? <HiOutlineCheck className="h-4 w-4 text-brand" aria-hidden /> : null}
                  <span className="flex-1 text-ink dark:text-white">{o.text}</span>
                  <span className="text-muted">{pct}%</span>
                  <span className="w-8 text-right text-muted">{o.votes.length}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex items-center justify-between text-sm text-muted">
        <span>{t("poll.totalVotes", { n: total })}</span>
        {owner && !poll.closed ? (
          <Button variant="ghost" onClick={() => closePoll(current.id)}>
            <HiOutlineXMark className="h-4 w-4" aria-hidden /> {t("poll.close")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
