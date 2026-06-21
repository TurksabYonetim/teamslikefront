// web/src/features/webinar/components/PollOverlay.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { pollsStore } from "../polls.store";
import { ME_ID } from "../webinar.data";

export function PollOverlay() {
  const { t } = useTranslation("webinar");
  const polls = useStore(pollsStore, (s) => s.polls);
  const vote = (pollId: string, optionId: string) => pollsStore.getState().vote(pollId, optionId, ME_ID);
  const live = polls.filter((p) => p.state === "live");

  if (live.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-ink">
        <Icon name="chartBar" className="h-[18px] w-[18px]" /> {t("polls")}
      </h3>
      <div className="space-y-3">
        {live.map((p) => {
          const total = p.options.reduce((n, o) => n + o.votes.length, 0);
          return (
            <div key={p.id}>
              <div className="mb-1 text-sm font-semibold text-ink">{p.question}</div>
              <ul className="space-y-1">
                {p.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(ME_ID);
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => vote(p.id, o.id)}
                        aria-pressed={mine}
                        className="block w-full min-h-11 rounded-md px-2 py-2 text-left text-sm transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="flex items-center gap-1 text-ink">
                            {mine ? <Icon name="check" className="h-3.5 w-3.5 text-brand" aria-hidden /> : null}
                            {o.text}
                          </span>
                          <span className={clsx("tabular-nums", mine ? "font-semibold text-blue-800" : "text-ink-2")}>{pct}%</span>
                        </span>
                        <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-line-2">
                          <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} aria-hidden />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-1 text-xs text-muted">{t("votes", { n: total })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
