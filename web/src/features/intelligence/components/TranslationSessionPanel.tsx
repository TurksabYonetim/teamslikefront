import { useTranslation } from "react-i18next";
import { HiOutlineLanguage, HiOutlineLockClosed } from "react-icons/hi2";
import { MdGraphicEq } from "react-icons/md";
import clsx from "clsx";
import { Badge, Button } from "@/components/ui";
import { useIntel } from "../intel.store";
import { captionsStore, useCaptions } from "../captions.store";

const LANGS = ["tr", "en", "es", "de", "fr", "ar"];

/** Canonical live-translation session controls (TranslationSession aggregate). */
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
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-ink dark:text-white">
          <HiOutlineLanguage className="h-[18px] w-[18px]" aria-hidden /> {t("session.title")}
        </h3>
        {session ? (
          <>
            <Badge tone="neutral">{session.sourceLang}</Badge>
            <Badge tone={session.voicePreserving ? "positive" : "neutral"}>
              <HiOutlineLockClosed className="h-[13px] w-[13px]" aria-hidden />{" "}
              {session.voicePreserving ? t("session.voiceOn") : t("session.voiceOff")}
            </Badge>
            <span className="text-base text-muted dark:text-gray-400">
              {t("session.buffered", { n: session.segments.length })}
            </span>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => captionsStore.getState().endSession()}
            >
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
        <>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {LANGS.map((code) => {
              const on = session.targetLangs.includes(code);
              return (
                <button
                  key={code}
                  aria-pressed={on}
                  onClick={() => toggleLang(code)}
                  className={clsx(
                    "rounded-md border px-2 py-1 text-base uppercase",
                    on
                      ? "border-brand text-brand"
                      : "border-line text-muted hover:bg-surface-3 dark:border-gray-700 dark:text-gray-400",
                  )}
                >
                  {code}
                </button>
              );
            })}
          </div>
          <button
            onClick={() =>
              captionsStore.getState().setVoicePreserving(!session.voicePreserving)
            }
            aria-pressed={session.voicePreserving}
            className={clsx(
              "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-base",
              session.voicePreserving
                ? "border-brand text-brand"
                : "border-line text-muted hover:bg-surface-3 dark:border-gray-700 dark:text-gray-400",
            )}
          >
            <MdGraphicEq className="h-4 w-4" aria-hidden /> {t("session.voicePreserve")}
          </button>
        </>
      ) : null}
    </div>
  );
}
