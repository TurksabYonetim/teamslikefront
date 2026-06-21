// web/src/features/webinar/components/QnaBoard.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { useCan } from "@/lib/authStore";
import { qnaStore } from "../qna.store";
import { sortQna } from "../webinar.dom";
import { ME_ID } from "../webinar.data";

export function QnaBoard() {
  const { t } = useTranslation("webinar");
  // Moderasyon (yanıtlandı işaretleme) yalnızca yöneticilere açık.
  const canModerate = useCan("admin.access");
  const items = useStore(qnaStore, (s) => s.items);
  const [text, setText] = useState("");
  const sorted = sortQna(items);

  const submit = () => {
    if (!text.trim()) return;
    qnaStore.getState().ask(text.trim(), ME_ID);
    setText("");
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-ink">
        <Icon name="question" className="h-4 w-4" /> {t("qna")}
      </h3>
      {/* Gönder ikonu input'un içine gömülü (sağ köşe) — input tam genişlik. */}
      <div className="relative mb-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("qnaPlaceholder")}
          aria-label={t("qnaPlaceholder")}
          className="input w-full pr-11"
        />
        <button
          type="button"
          aria-label={t("ask")}
          title={t("ask")}
          disabled={!text.trim()}
          onClick={submit}
          className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-brand text-white transition-[background-color,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-95 motion-reduce:transition-none disabled:opacity-50 disabled:pointer-events-none lg:h-8 lg:w-8"
        >
          <Icon name="send" className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-2" role="feed" aria-label={t("qna")}>
        {sorted.map((q) => {
          const up = q.upvotes.includes(ME_ID);
          return (
            <li key={q.id} className={clsx("rounded-md border border-line p-2", q.answered && "opacity-60")}>
              <div className="text-sm text-ink">{q.text}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                {q.answered ? <span className="font-medium text-green-800">{t("answered")}</span> : null}
                {canModerate && !q.answered ? (
                  <button onClick={() => qnaStore.getState().answer(q.id)} className="rounded-md px-2 py-1.5 text-blue-800 hover:bg-surface-2">
                    {t("markAnswered")}
                  </button>
                ) : null}
                <button
                  onClick={() => qnaStore.getState().upvote(q.id, ME_ID)}
                  aria-pressed={up}
                  className={clsx(
                    "ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-1.5",
                    up ? "border-brand text-blue-800" : "border-line text-muted",
                  )}
                >
                  <Icon name="thumbUp" className="h-3.5 w-3.5" /> {q.upvotes.length}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
