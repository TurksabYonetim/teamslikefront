import { useTranslation } from "react-i18next";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import { Dropdown } from "@/components/ui";
import { EMOJI_PALETTE } from "../types";

/** Kompakt emoji seçici (Slack/Teams/WhatsApp tarzı). */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const { t } = useTranslation("messaging");
  return (
    <Dropdown
      label={t("emoji")}
      align="start"
      side="top"
      menuWidth="w-auto"
      triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
      trigger={<HiOutlineFaceSmile className="h-[18px] w-[18px]" aria-hidden />}
    >
      <div className="grid grid-cols-8 gap-1">
        {EMOJI_PALETTE.map((e) => (
          <button
            key={e}
            type="button"
            aria-label={e}
            onClick={() => onPick(e)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:active:scale-[0.92] dark:hover:bg-gray-700"
          >
            <span aria-hidden>{e}</span>
          </button>
        ))}
      </div>
    </Dropdown>
  );
}
