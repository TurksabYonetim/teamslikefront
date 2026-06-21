import { useTranslation } from "react-i18next";
import { HiOutlineSparkles } from "react-icons/hi2";

const SMART_REPLY_KEYS = ["smartReply.thanks", "smartReply.onIt", "smartReply.willDo"];

/** Akıllı yanıt öneri çipleri. */
export function SmartReplies({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useTranslation("messaging");
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
      <HiOutlineSparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
      {SMART_REPLY_KEYS.map((key) => {
        const text = t(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onPick(text)}
            className="rounded-full border border-line bg-surface-2 px-3 py-1.5 min-h-[36px] text-sm font-medium text-ink transition-[background-color,border-color,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:border-gray-300 hover:bg-surface-3 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 motion-safe:active:scale-[0.97]"
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
