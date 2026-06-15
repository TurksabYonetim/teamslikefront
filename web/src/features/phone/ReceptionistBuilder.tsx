import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button } from "@/components/ui";
import { useReceptionist, receptionistStore } from "./receptionistStore";
import type { CaptureField, ReceptionistActionKind } from "./phone.types";

const ACTIONS: ReceptionistActionKind[] = ["route_queue", "route_extension", "answer_faq", "book", "voicemail", "human"];
const CAPTURE_FIELDS: CaptureField[] = ["name", "phone", "reason"];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/** AI resepsiyon: intent/capture editörü + canlı oturum simülasyonu. */
export function ReceptionistBuilder() {
  const { t } = useTranslation("phone");
  const config = useReceptionist((s) => s.config);
  const session = useReceptionist((s) => s.session);

  const [label, setLabel] = useState("");
  const [phrases, setPhrases] = useState("");
  const [action, setAction] = useState<ReceptionistActionKind>("route_queue");
  const [target, setTarget] = useState("");
  const [utterance, setUtterance] = useState("");

  const addIntent = () => {
    const l = label.trim();
    if (!l) return;
    receptionistStore.getState().addIntent({
      id: `int_${uid().slice(0, 6)}`,
      label: l,
      phrases: phrases.split(",").map((p) => p.trim()).filter(Boolean),
      action,
      target: target.trim() || undefined,
    });
    setLabel("");
    setPhrases("");
    setTarget("");
  };

  const send = () => {
    if (!utterance.trim()) return;
    receptionistStore.getState().ask(utterance);
    setUtterance("");
  };

  const detectedLabel = config.intents.find((i) => i.id === session.detectedIntentId)?.label;

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-4 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-4 lg:max-w-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">{t("reception.title")}</h2>
          <button
            type="button"
            onClick={() => receptionistStore.getState().toggleEnabled()}
            aria-pressed={config.enabled}
            className={
              "rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
              (config.enabled ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300")
            }
          >
            {config.enabled ? t("reception.enabled") : t("reception.disabled")}
          </button>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">{t("reception.intents")}</p>
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
            {config.intents.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-2 text-sm">
                <span className="min-w-0">
                  <span className="font-medium text-gray-900 dark:text-white">{i.label}</span>
                  <span className="ml-2 text-sm text-muted">{t(`enums.receptionAction.${i.action}`)}{i.target ? ` (${i.target})` : ""}</span>
                  <span className="block truncate text-xs text-muted">{i.phrases.join(", ")}</span>
                </span>
                <button
                  type="button"
                  onClick={() => receptionistStore.getState().removeIntent(i.id)}
                  aria-label={`${t("reception.remove")} ${i.label}`}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  {t("reception.remove")}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("reception.label")} aria-label={t("reception.label")} className="input" />
            <input value={phrases} onChange={(e) => setPhrases(e.target.value)} placeholder={t("reception.phrases")} aria-label={t("reception.phrases")} className="input" />
            <div className="flex gap-2">
              <select value={action} onChange={(e) => setAction(e.target.value as ReceptionistActionKind)} aria-label={t("reception.action")} className="input flex-1">
                {ACTIONS.map((a) => <option key={a} value={a}>{t(`enums.receptionAction.${a}`)}</option>)}
              </select>
              <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder={t("reception.target")} aria-label={t("reception.target")} className="input w-28" />
            </div>
            <Button size="sm" onClick={addIntent} disabled={!label.trim()}>{t("reception.addIntent")}</Button>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">{t("reception.capture")}</p>
          <div className="flex flex-wrap gap-4">
            {CAPTURE_FIELDS.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={config.captureFields.includes(f)} onChange={() => receptionistStore.getState().toggleCaptureField(f)} aria-label={f} className="h-4 w-4" />
                {f}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("reception.simTitle")}</p>
          <button type="button" onClick={() => receptionistStore.getState().resetSession()} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
            {t("reception.reset")}
          </button>
        </div>

        <div className="flex min-h-[12rem] flex-1 flex-col gap-2 overflow-y-auto p-4">
          {session.turns.map((turn) => (
            <div key={turn.id} className={"flex " + (turn.who === "caller" ? "justify-end" : "justify-start")}>
              <div className={"max-w-[80%] rounded-2xl px-3 py-2 text-sm " + (turn.who === "caller" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100")}>
                {turn.text}
              </div>
            </div>
          ))}
        </div>

        {session.turns.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {t("reception.detected")}: {detectedLabel ? <Badge>{detectedLabel}</Badge> : t("reception.noMatch")}
            {session.action ? <span className="ml-1">→ {t(`enums.receptionAction.${session.action}`)}</span> : null}
          </div>
        )}

        <div className="flex items-end gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
          <textarea
            value={utterance}
            onChange={(e) => setUtterance(e.target.value)}
            placeholder={t("reception.simPlaceholder")}
            aria-label={t("reception.simPlaceholder")}
            rows={1}
            className="input min-h-[2.5rem] flex-1 resize-none"
          />
          <Button onClick={send} disabled={!utterance.trim()}>{t("reception.send")}</Button>
        </div>
      </div>
    </div>
  );
}
