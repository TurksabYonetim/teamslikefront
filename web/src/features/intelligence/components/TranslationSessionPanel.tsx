import { useTranslation } from "react-i18next";
import { HiOutlineLanguage, HiOutlineLockClosed } from "react-icons/hi2";
import { MdGraphicEq } from "react-icons/md";
import clsx from "clsx";
import { Button } from "@/components/ui";
import { useIntel } from "../intel.store";
import { captionsStore, useCaptions } from "../captions.store";

const LANGS = ["tr", "en", "es", "de", "fr", "ar"];

/** Canonical live-translation session controls (TranslationSession aggregate).
 *  Compact AAA toolbar: status badge + target-language chips + voice-preserve. */
export function TranslationSessionPanel() {
  const { t } = useTranslation("intelligence");
  const activeSourceId = useIntel((s) => s.activeSourceId);
  const session = useCaptions((s) => s.session);

  const toggleLang = (code: string) => {
    if (!session) return;
    const has = session.targetLangs.includes(code);
    const next = has
      ? session.targetLangs.filter((l) => l !== code)
      : [...session.targetLangs, code];
    captionsStore.getState().setTargetLangs(next.length ? next : [code]);
  };

  return (
    <div className="rounded-card border border-line bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-white">
          <HiOutlineLanguage className="h-4 w-4 text-brand dark:text-blue-400" aria-hidden /> {t("session.title")}
        </h3>
        {session ? (
          <>
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
                (session.voicePreserving
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                  : "bg-surface-3 text-ink-2 dark:bg-gray-700 dark:text-gray-200")
              }
            >
              <HiOutlineLockClosed className="h-[13px] w-[13px]" aria-hidden />{" "}
              {session.voicePreserving ? t("session.voiceOn") : t("session.voiceOff")}
            </span>
            <Button variant="ghost" className="ml-auto" onClick={() => captionsStore.getState().endSession()}>
              {t("session.end")}
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            className="ml-auto"
            onClick={() => captionsStore.getState().startSession(activeSourceId, ["tr"])}
          >
            {t("session.start")}
          </Button>
        )}
      </div>

      {session ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex flex-wrap gap-1" role="group" aria-label={t("translateTo")}>
            {LANGS.map((code) => {
              const on = session.targetLangs.includes(code);
              return (
                <button
                  key={code}
                  aria-pressed={on}
                  onClick={() => toggleLang(code)}
                  className={clsx(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-[var(--dur-press)] motion-safe:ease-[var(--ease-out)] motion-safe:active:scale-[0.94]",
                    on
                      ? "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "border-line text-ink-2 hover:bg-surface-3 dark:border-gray-700 dark:text-gray-300",
                  )}
                >
                  {code}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => captionsStore.getState().setVoicePreserving(!session.voicePreserving)}
            aria-pressed={session.voicePreserving}
            aria-label={t("session.voicePreserve")}
            title={t("session.voicePreserve")}
            className={clsx(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-[var(--dur-press)] motion-safe:ease-[var(--ease-out)] motion-safe:active:scale-[0.94]",
              session.voicePreserving
                ? "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                : "border-line text-ink-2 hover:bg-surface-3 dark:border-gray-700 dark:text-gray-300",
            )}
          >
            <MdGraphicEq className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
