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
      triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
      trigger={<HiOutlineFaceSmile className="h-[18px] w-[18px]" aria-hidden />}
    >
      <div className="grid w-64 grid-cols-8 gap-1 p-1">
        {EMOJI_PALETTE.map((e) => (
          <button
            key={e}
            type="button"
            aria-label={e}
            onClick={() => onPick(e)}
            className="flex h-7 items-center justify-center rounded-md text-lg hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            <span aria-hidden>{e}</span>
          </button>
        ))}
      </div>
    </Dropdown>
  );
}
