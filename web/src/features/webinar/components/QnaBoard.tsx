// web/src/features/webinar/components/QnaBoard.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/ui";
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
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-white">
        <Icon name="question" className="h-4 w-4" /> {t("qna")}
      </h3>
      <div className="mb-2 flex items-end gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("qnaPlaceholder")}
          aria-label={t("qnaPlaceholder")}
          className="h-11 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2.5 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <IconButton label={t("ask")} variant="primary" disabled={!text.trim()} onClick={submit}>
          <Icon name="send" className="h-4 w-4" />
        </IconButton>
      </div>
      <ul className="space-y-2" role="feed" aria-label={t("qna")}>
        {sorted.map((q) => {
          const up = q.upvotes.includes(ME_ID);
          return (
            <li key={q.id} className={clsx("rounded-md border border-slate-700 p-2", q.answered && "opacity-60")}>
              <div className="text-sm text-white">{q.text}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                {q.answered ? <span className="text-green-400">{t("answered")}</span> : null}
                {canModerate && !q.answered ? (
                  <button onClick={() => qnaStore.getState().answer(q.id)} className="rounded-md px-2 py-1.5 text-brand hover:bg-slate-800">
                    {t("markAnswered")}
                  </button>
                ) : null}
                <button
                  onClick={() => qnaStore.getState().upvote(q.id, ME_ID)}
                  aria-pressed={up}
                  className={clsx(
                    "ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-1.5",
                    up ? "border-brand text-brand" : "border-slate-600 text-slate-400",
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
