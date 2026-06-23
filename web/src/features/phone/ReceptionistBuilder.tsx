import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowRightCircle,
  HiOutlinePhone,
  HiOutlineQuestionMarkCircle,
  HiOutlineCalendarDays,
  HiOutlineMicrophone,
  HiOutlineUser,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import clsx from "clsx";
import { Badge, Button, Select } from "@/components/ui";
import { useReceptionist, receptionistStore } from "./receptionistStore";
import type { CaptureField, ReceptionistActionKind } from "./phone.types";

const ACTIONS: ReceptionistActionKind[] = ["route_queue", "route_extension", "answer_faq", "book", "voicemail", "human"];
const CAPTURE_FIELDS: CaptureField[] = ["name", "phone", "reason"];

import { uid } from "@/lib/uid";

/** Eylem tipine göre ikon rozeti + renk tonu (yapılandırma tarafı görsel ipucu). */
function actionMeta(action: ReceptionistActionKind): { tone: "blue" | "green" | "amber" | "gray"; Icon: IconType } {
  switch (action) {
    case "route_queue":
      return { tone: "blue", Icon: HiOutlineArrowRightCircle };
    case "route_extension":
      return { tone: "green", Icon: HiOutlinePhone };
    case "answer_faq":
      return { tone: "amber", Icon: HiOutlineQuestionMarkCircle };
    case "book":
      return { tone: "blue", Icon: HiOutlineCalendarDays };
    case "voicemail":
      return { tone: "gray", Icon: HiOutlineMicrophone };
    case "human":
      return { tone: "gray", Icon: HiOutlineUser };
  }
}

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
  const [formOpen, setFormOpen] = useState(false);

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
    <div className="reception-builder mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-4 lg:max-w-5xl lg:flex-row lg:items-start xl:gap-8">
      <div className="flex w-full flex-col gap-4 lg:max-w-md">
        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 truncate text-lg font-semibold text-ink sm:text-xl">{t("reception.title")}</h2>
          <button
            type="button"
            onClick={() => receptionistStore.getState().toggleEnabled()}
            aria-pressed={config.enabled}
            className={
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
              (config.enabled ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300")
            }
          >
            {config.enabled && <span className="reception-status-dot h-1.5 w-1.5 rounded-full bg-green-700 dark:bg-green-300" aria-hidden="true" />}
            {config.enabled ? t("reception.enabled") : t("reception.disabled")}
          </button>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">{t("reception.intents")}</p>
          <ul className="mb-4 flex flex-col gap-0.5">
            {config.intents.map((i) => {
              const { tone, Icon } = actionMeta(i.action);
              const matched = i.id === session.detectedIntentId;
              return (
                <li
                  key={i.id}
                  className={
                    "flex items-start gap-2.5 rounded-lg px-2 py-2 " +
                    (matched ? "reception-intent--matched" : "")
                  }
                >
                  <span className={"reception-ico reception-ico--" + tone + " mt-0.5 shrink-0"} aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{i.label}</span>
                      <button
                        type="button"
                        onClick={() => receptionistStore.getState().removeIntent(i.id)}
                        aria-label={`${t("reception.remove")} ${i.label}`}
                        className="-me-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash size={15} aria-hidden />
                      </button>
                    </div>
                    <span className="block text-xs text-muted">
                      {t(`enums.receptionAction.${i.action}`)}{i.target ? ` · ${i.target}` : ""}
                    </span>
                    {i.phrases.length > 0 && (
                      <span className="mt-0.5 block truncate text-xs text-muted/90">{i.phrases.join(", ")}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line pt-2 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setFormOpen((o) => !o)}
              aria-expanded={formOpen}
              aria-controls="reception-add-form"
              className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="flex items-center gap-1.5">
                <HiOutlinePlus size={16} aria-hidden /> {t("reception.addIntent")}
              </span>
              <HiOutlineChevronDown
                size={16}
                aria-hidden
                className={clsx(
                  "shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
                  formOpen && "rotate-180",
                )}
              />
            </button>
            <div
              id="reception-add-form"
              className={clsx(
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                formOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 pt-2">
                  <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("reception.label")} aria-label={t("reception.label")} className="input" />
                  <input value={phrases} onChange={(e) => setPhrases(e.target.value)} placeholder={t("reception.phrases")} aria-label={t("reception.phrases")} className="input" />
                  <Select<ReceptionistActionKind>
                    value={action}
                    onChange={setAction}
                    options={ACTIONS.map((a) => ({ value: a, label: t(`enums.receptionAction.${a}`) }))}
                    aria-label={t("reception.action")}
                    className="w-full"
                  />
                  <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder={t("reception.target")} aria-label={t("reception.target")} className="input" />
                  <Button size="sm" onClick={addIntent} disabled={!label.trim()} className="w-full">{t("reception.add")}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">{t("reception.capture")}</p>
          <div className="flex flex-wrap gap-2">
            {CAPTURE_FIELDS.map((f) => (
              <label
                key={f}
                className="reception-field flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink dark:border-gray-700 dark:text-gray-300"
              >
                <input type="checkbox" checked={config.captureFields.includes(f)} onChange={() => receptionistStore.getState().toggleCaptureField(f)} aria-label={f} className="checkbox" />
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
          {session.turns.length === 0 ? (
            <div className="m-auto flex max-w-xs flex-col items-center gap-2.5 text-center">
              <HiOutlineChatBubbleLeftRight className="reception-illus" size={48} aria-hidden />
              <p className="text-sm font-semibold text-ink">{t("reception.simEmptyTitle")}</p>
              <p className="text-xs leading-relaxed text-muted dark:text-gray-400">{t("reception.simEmptyDescription")}</p>
            </div>
          ) : (
            session.turns.map((turn) => (
              <div key={turn.id} className={"reception-turn flex " + (turn.who === "caller" ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                    (turn.who === "caller"
                      ? "reception-bubble--caller bg-primary-600 text-white"
                      : "reception-bubble--ai bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100")
                  }
                >
                  {turn.text}
                </div>
              </div>
            ))
          )}
        </div>

        {session.turns.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {t("reception.detected")}: {detectedLabel ? <Badge>{detectedLabel}</Badge> : t("reception.noMatch")}
            {session.action ? <span className="ml-1">→ {t(`enums.receptionAction.${session.action}`)}</span> : null}
          </div>
        )}

        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          <div className="relative">
            <textarea
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("reception.simPlaceholder")}
              aria-label={t("reception.simPlaceholder")}
              rows={1}
              className="input min-h-[2.75rem] w-full resize-none pe-12"
            />
            <button
              type="button"
              onClick={send}
              disabled={!utterance.trim()}
              aria-label={t("reception.send")}
              className="absolute bottom-1.5 end-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white transition-[transform,background-color,opacity] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-brand-600 motion-safe:active:scale-[0.95] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40 disabled:hover:bg-brand"
            >
              <HiOutlinePaperAirplane size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
