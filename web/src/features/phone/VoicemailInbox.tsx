import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCheckCircle, HiOutlineMicrophone } from "react-icons/hi2";
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

  const sorted = [...voicemails].sort((a, b) => b.receivedAt - a.receivedAt);
  const unheard = voicemails.filter((v) => !v.heard).length;
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

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("voicemail.title")}</h2>
        {unheard > 0 && (
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200">
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
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  <HiOutlineMicrophone size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={"truncate font-medium " + (vm.heard ? "text-gray-600 dark:text-gray-300" : "text-gray-900 dark:text-white")}>
                      {callerLabel(vm.from)}
                    </p>
                    {!vm.heard && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-hidden />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dateFmt.format(new Date(vm.receivedAt))} · {formatDuration(vm.durationSec)}
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{t("voicemail.transcript")}: </span>
                    {vm.transcript || <span className="italic text-gray-400">{t("voicemail.noTranscript")}</span>}
                  </p>
                </div>
                {vm.heard ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <HiOutlineCheckCircle size={16} aria-hidden /> {t("voicemail.heard")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => voicemailStore.getState().markHeard(vm.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-primary-400 dark:hover:bg-gray-700"
                  >
                    {t("voicemail.markHeard")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("voicemail.greetingTitle")}</h3>
        <label htmlFor="vm-greeting" className="sr-only">{t("voicemail.greetingLabel")}</label>
        <textarea
          id="vm-greeting"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="input w-full resize-y"
        />
        <div className="mt-2 flex items-center gap-3">
          <Button onClick={saveGreeting}>{t("voicemail.greetingSave")}</Button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400" role="status">{t("voicemail.greetingSaved")}</span>}
        </div>
      </div>
    </div>
  );
}
