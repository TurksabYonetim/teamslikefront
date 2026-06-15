import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { callStore, useCall } from "./callStore";
import { formatNumber } from "./routing";
import type { CallOutcome } from "./phone.types";

const OUTCOMES: CallOutcome[] = ["resolved", "follow_up", "no_answer", "sale", "spam"];

/** Yanıtlanan çağrı sonrası dispozisyon kartı (pendingDisposition varken görünür). */
export function WrapUpCard() {
  const { t } = useTranslation("phone");
  const pending = useCall((s) => s.pendingDisposition);
  const [outcome, setOutcome] = useState<CallOutcome>("resolved");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");

  if (!pending) return null;

  const save = () => {
    callStore.getState().saveDisposition({
      callId: pending.callId,
      outcome,
      note: note.trim(),
      tags: tags.split(",").map((x) => x.trim()).filter(Boolean),
    });
  };

  return (
    <div
      role="dialog"
      aria-label={t("wrapUp.title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {t("wrapUp.title")} · {formatNumber(pending.peerNumber)}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-xs text-gray-500">
            {t("wrapUp.outcome")}
            <select value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)} aria-label={t("wrapUp.outcome")} className="input">
              {OUTCOMES.map((o) => <option key={o} value={o}>{t(`enums.outcome.${o}`)}</option>)}
            </select>
          </label>
          <label className="flex flex-1 flex-col text-xs text-gray-500">
            {t("wrapUp.note")}
            <input value={note} onChange={(e) => setNote(e.target.value)} aria-label={t("wrapUp.note")} className="input" />
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("wrapUp.tags")}
            <input value={tags} onChange={(e) => setTags(e.target.value)} aria-label={t("wrapUp.tags")} className="input w-40" />
          </label>
          <div className="flex gap-2">
            <Button onClick={save}>{t("wrapUp.save")}</Button>
            <Button variant="ghost" onClick={() => callStore.getState().dismissWrapUp()}>{t("wrapUp.dismiss")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
