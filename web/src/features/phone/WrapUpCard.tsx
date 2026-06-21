import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Select } from "@/components/ui";
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface shadow-2xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="text-sm font-semibold text-ink">
          {t("wrapUp.title")} · {formatNumber(pending.peerNumber)}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Select<CallOutcome>
            value={outcome}
            onChange={setOutcome}
            options={OUTCOMES.map((o) => ({ value: o, label: t(`enums.outcome.${o}`) }))}
            label={t("wrapUp.outcome")}
            size="sm"
            className="w-full sm:w-44"
          />
          <label className="flex w-full min-w-0 flex-1 flex-col text-xs text-muted sm:w-auto">
            {t("wrapUp.note")}
            <input value={note} onChange={(e) => setNote(e.target.value)} aria-label={t("wrapUp.note")} className="input" />
          </label>
          <label className="flex w-full min-w-0 flex-col text-xs text-muted sm:w-auto">
            {t("wrapUp.tags")}
            <input value={tags} onChange={(e) => setTags(e.target.value)} aria-label={t("wrapUp.tags")} className="input sm:w-40" />
          </label>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button onClick={save} className="flex-1 sm:flex-none">{t("wrapUp.save")}</Button>
            <Button variant="ghost" onClick={() => callStore.getState().dismissWrapUp()} className="flex-1 sm:flex-none">{t("wrapUp.dismiss")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
