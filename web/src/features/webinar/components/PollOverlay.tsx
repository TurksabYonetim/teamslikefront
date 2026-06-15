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
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-white">
        <Icon name="chartBar" className="h-[18px] w-[18px]" /> {t("polls")}
      </h3>
      <div className="space-y-3">
        {live.map((p) => {
          const total = p.options.reduce((n, o) => n + o.votes.length, 0);
          return (
            <div key={p.id}>
              <div className="mb-1 text-sm font-semibold text-white">{p.question}</div>
              <ul className="space-y-1.5">
                {p.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(ME_ID);
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => vote(p.id, o.id)}
                        aria-pressed={mine}
                        className={clsx(
                          "relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm",
                          mine ? "border-brand" : "border-slate-600",
                        )}
                      >
                        <span className="absolute inset-y-0 left-0 bg-slate-700" style={{ width: `${pct}%` }} aria-hidden />
                        <span className="relative flex items-center gap-2">
                          {mine ? <Icon name="check" className="h-4 w-4 text-brand" /> : null}
                          <span className="flex-1 text-white">{o.text}</span>
                          <span className="text-slate-200">{pct}%</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-1 text-xs text-slate-400">{t("votes", { n: total })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
