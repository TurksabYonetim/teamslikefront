import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCheck, HiOutlineCheckCircle, HiOutlineChevronDown, HiOutlineMicrophone } from "react-icons/hi2";
import clsx from "clsx";
import { Button, EmptyState } from "@/components/ui";
import { useContacts } from "./phone.hooks";
import { useVoicemail, voicemailStore } from "./voicemailStore";
import { nameForNumber } from "./phone.utils";
import { formatNumber } from "./routing";
import { formatDuration } from "./phone.types";

/** Sesli mesaj kutusu: liste (transkript + dinlendi işaretleme) + karşılama editörü. */
export function VoicemailInbox() {
  const { t, i18n } = useTranslation("phone");
  const voicemails = useVoicemail((s) => s.voicemails);
  const greeting = useVoicemail((s) => s.greeting);
  const { data: contacts } = useContacts();
  // draft, mount'ta store.greeting'ten tohumlanır; dış değişiklikler bilinçli olarak
  // resync edilmez — yeni mount (sekme değişimi) her zaman güncel değeri alır.
  const [draft, setDraft] = useState(greeting);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);
  // Katlanan kartlar: açık olanların id kümesi (başlığa tıklayınca aç/kapat).
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());
  const toggleOpen = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const sorted = useMemo(() => [...voicemails].sort((a, b) => b.receivedAt - a.receivedAt), [voicemails]);
  const unheard = useMemo(() => voicemails.filter((v) => !v.heard).length, [voicemails]);
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }),
    [i18n.language],
  );

  const callerLabel = (from: string) =>
    nameForNumber(from, contacts ?? []) ?? formatNumber(from);

  const saveGreeting = () => {
    voicemailStore.getState().setGreeting(draft);
    setSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 2000);
  };

  // Sesli mesaj gövdesi — karşılama kartı odağı + giriş ".voicemail-inbox
  // .vm-greeting-card" üzerinden styles/index.css'te (impeccable delight).
  const renderVoicemail = () => (
    <div className="voicemail-inbox mx-auto flex h-full w-full max-w-3xl flex-col gap-5 overflow-y-auto p-3 sm:gap-6 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 truncate text-lg font-semibold text-ink sm:text-xl">{t("voicemail.title")}</h2>
        {unheard > 0 && (
          <span className="shrink-0 rounded-full bg-brand-subtle px-2.5 py-0.5 text-xs font-medium text-brand sm:text-sm">
            {t("voicemail.unheard", { count: unheard })}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title={t("voicemail.empty")} description={t("voicemail.emptyDescription")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((vm) => (
            <li
              key={vm.id}
              className="vm-card relative rounded-lg border border-line bg-surface"
            >
              <button
                type="button"
                onClick={() => toggleOpen(vm.id)}
                aria-expanded={openIds.has(vm.id)}
                aria-controls={`vm-tr-${vm.id}`}
                className="flex w-full items-start gap-2.5 rounded-lg p-3 text-left transition-colors hover:bg-line-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:gap-3 sm:p-4"
              >
                <span className="vm-icon mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand sm:h-9 sm:w-9">
                  <HiOutlineMicrophone size={18} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={clsx(
                      "flex min-w-0 items-center gap-1.5",
                      vm.heard ? "pr-7 sm:pr-[5.5rem]" : "pr-11 sm:pr-[7.5rem]",
                    )}
                  >
                    <span className={"truncate font-medium " + (vm.heard ? "text-muted" : "text-ink")}>
                      {callerLabel(vm.from)}
                    </span>
                    {!vm.heard && <span className="vm-dot h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />}
                    <HiOutlineChevronDown
                      size={16}
                      aria-hidden
                      className={clsx(
                        "ml-auto shrink-0 text-muted transition-transform duration-200 ease-out motion-reduce:transition-none",
                        openIds.has(vm.id) && "rotate-180",
                      )}
                    />
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-muted">
                    {dateFmt.format(new Date(vm.receivedAt))} · {formatDuration(vm.durationSec)}
                  </span>
                </span>
              </button>
              <div className="pointer-events-none absolute right-3 top-3 sm:right-4 sm:top-4">
                {vm.heard ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-green-600 dark:text-green-400">
                    <HiOutlineCheckCircle size={16} aria-hidden />
                    <span className="sr-only sm:not-sr-only">{t("voicemail.heard")}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => voicemailStore.getState().markHeard(vm.id)}
                    className="pointer-events-auto -mt-1 -mr-1 inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-2.5"
                  >
                    <HiOutlineCheck size={16} aria-hidden />
                    <span className="sr-only sm:not-sr-only">{t("voicemail.markHeard")}</span>
                  </button>
                )}
              </div>
              <div
                id={`vm-tr-${vm.id}`}
                role="region"
                aria-label={t("voicemail.transcript")}
                className={clsx(
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                  openIds.has(vm.id) ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="break-words border-t border-line px-3 py-3 text-sm text-ink-2 sm:px-4">
                    <span className="font-medium">{t("voicemail.transcript")}: </span>
                    {vm.transcript || <span className="italic text-muted">{t("voicemail.noTranscript")}</span>}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="vm-greeting-card rounded-lg border border-line bg-surface p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t("voicemail.greetingTitle")}</h3>
        <label htmlFor="vm-greeting" className="sr-only">{t("voicemail.greetingLabel")}</label>
        <textarea
          id="vm-greeting"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="input min-h-[4.5rem] resize-y"
        />
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button onClick={saveGreeting} className="max-sm:w-full">{t("voicemail.greetingSave")}</Button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400" role="status">{t("voicemail.greetingSaved")}</span>}
        </div>
      </div>
    </div>
  );

  return renderVoicemail();
}
